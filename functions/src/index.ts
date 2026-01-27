/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

admin.initializeApp();

export const sendChatNotification = onDocumentCreated(
	"notifications/{notificationId}",
	async (event) => {
		const snap = event.data;
		if (!snap) return;

		const data = snap.data() as any;
		if (data?.type !== "chat") return;

		const toUserId = data.toUserId;
		if (!toUserId) return;

		const userSnap = await admin.firestore().doc(`users/${toUserId}`).get();
		if (!userSnap.exists) return;

		const tokensRaw = (userSnap.data() as any)?.fcmTokens;
		let tokens: string[] = [];

		if (Array.isArray(tokensRaw)) {
			tokens = tokensRaw;
		} else if (tokensRaw && typeof tokensRaw === "object") {
			tokens = Object.keys(tokensRaw).filter((t) => tokensRaw[t]);
		}

		if (!tokens.length) return;

		const title = data.productTitle
			? `New message about ${data.productTitle}`
			: "New message";
		const body = data.message || "You have a new message";

		const response = await admin.messaging().sendEachForMulticast({
			tokens,
			notification: {
				title,
				body,
			},
			data: {
				type: "chat",
				chatId: data.chatId || "",
				productId: data.productId || "",
				buyerId: data.buyerId || "",
				sellerId: data.sellerId || "",
			},
		});

		const invalidTokens: string[] = [];
		response.responses.forEach((r, idx) => {
			if (!r.success) {
				const code = r.error?.code || "";
				if (code.includes("registration-token-not-registered") || code.includes("invalid-registration-token")) {
					invalidTokens.push(tokens[idx]);
				}
			}
		});

		if (invalidTokens.length && Array.isArray(tokensRaw)) {
			await admin.firestore().doc(`users/${toUserId}`).update({
				fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalidTokens),
			});
		}

		await snap.ref.update({
			sentAt: admin.firestore.FieldValue.serverTimestamp(),
			deliveryCount: response.successCount,
		});

		logger.info("Chat notification sent", {
			notificationId: snap.id,
			toUserId,
			successCount: response.successCount,
			failureCount: response.failureCount,
		});
	}
);

export const normalizeChatMessages = onRequest(async (req, res) => {
	const secret = process.env.MIGRATION_SECRET;
	const provided = req.get("x-migration-key") || (req.query.key as string | undefined);

	if (!secret || provided !== secret) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	const pageSize = Math.min(Number(req.query.limit) || 200, 500);
	const startAfterPath = (req.query.startAfter as string | undefined) || null;

	let q = admin
		.firestore()
		.collectionGroup("messages")
		.orderBy(admin.firestore.FieldPath.documentId())
		.limit(pageSize);

	if (startAfterPath) {
		const startDoc = await admin.firestore().doc(startAfterPath).get();
		if (!startDoc.exists) {
			res.status(400).json({ error: "Invalid startAfter path" });
			return;
		}
		q = q.startAfter(startDoc);
	}

	const snap = await q.get();
	let updatedCount = 0;
	let processedCount = snap.size;

	if (snap.empty) {
		res.json({ processed: 0, updated: 0, nextCursor: null, done: true });
		return;
	}

	const batch = admin.firestore().batch();
	snap.docs.forEach((docSnap) => {
		const data: any = docSnap.data() || {};
		const updates: Record<string, any> = {};

		if (data.text && typeof data.text === "object") {
			const nestedText = typeof data.text.text === "string" ? data.text.text : "";
			updates.text = nestedText;
			if (!data.timestamp) {
				const nestedTimestamp = data.text.createdAt || data.text.timestamp;
				if (nestedTimestamp) updates.timestamp = nestedTimestamp;
			}
		}

		if (!data.timestamp && data.createdAt) {
			updates.timestamp = data.createdAt;
		}

		if (Object.keys(updates).length) {
			batch.update(docSnap.ref, updates);
			updatedCount += 1;
		}
	});

	if (updatedCount > 0) {
		await batch.commit();
	}

	const lastDoc = snap.docs[snap.docs.length - 1];
	res.json({
		processed: processedCount,
		updated: updatedCount,
		nextCursor: lastDoc?.ref.path || null,
		done: snap.size < pageSize,
	});
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
