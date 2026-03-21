export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const title = 'Satyam Careers — Financial Recruitment Platform';
  const description = 'Satyam Careers connects finance professionals with trusted employers across India. Browse openings in banking, sales, collections, credit, and branch roles — apply online and track your application.';
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="finance jobs, banking jobs, sales jobs, collections jobs, credit jobs, branch manager jobs, recruitment, Satyam Careers" />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      <link rel="canonical" href={siteUrl} />
    </>
  );
}
