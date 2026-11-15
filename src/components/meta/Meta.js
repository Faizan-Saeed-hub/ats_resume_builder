import Head from "next/head";

export default function Meta({ title, keywords, description }) {
    const homepage = "https://atsresume.vercel.app/";
    const logo = "https://atsresume.vercel.app/assets/logo.png";
    const favicon = "/assets/favicon.ico";

    function isiteJsonLd() {
        return {
            __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "ATSResume",
                "url": homepage,
                "image": logo,
                "description": description || "Professional ATS-Friendly Resume Builder",
                "applicationCategory": "BusinessApplication",
                "operatingSystem": "All",
                "author": {
                    "@type": "Person",
                    "name": "Muhammad Faizan"
                },
                "creator": {
                    "@type": "Person",
                    "name": "Muhammad Faizan"
                },
                "keywords": keywords || "ATS resume builder, resume maker, CV",
                "inLanguage": "en"
            })
        };
    }

    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="keywords" content={keywords} />
            <meta name="description" content={description} />
            <meta charSet="utf-8" />
            <link rel="icon" href={favicon} />
            <title>{title}</title>
            <meta name="author" content="Muhammad Faizan" />
            <meta name="copyright" content="Muhammad Faizan" />

            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={homepage} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={logo} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={homepage} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={logo} />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={isiteJsonLd()}
                key="isiteJsonLd"
            />
        </Head>
    );
}
