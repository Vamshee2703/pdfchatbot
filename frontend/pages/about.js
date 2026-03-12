import Link from "next/link";

export default function About() {
  return (
    <div className="page">

      {/* HERO */}

      <section className="hero">

        <h1>AI Web Copilot Platform</h1>

        <p>
          Explore websites, interact with documents, and collaborate with
          others using intelligent AI assistants designed to simplify
          information discovery and learning.
        </p>

        <Link href="/login">
          <button className="heroBtn">Get Started</button>
        </Link>

      </section>


      {/* FEATURES */}

      <section className="features">

        <h2>Powerful Features</h2>

        <div className="featureGrid">

          <div className="card">
            <div className="icon">🌐</div>
            <h3>Website Copilot</h3>
            <p>
              Ask questions about any website. Our AI crawls pages and provides
              contextual answers instantly.
            </p>

            <ul>
              <li>AI-powered website Q&A</li>
              <li>Smart content extraction</li>
              <li>Context-aware responses</li>
              <li>Works even when preview is blocked</li>
            </ul>
          </div>


          <div className="card">
            <div className="icon">📄</div>
            <h3>PDF Chat</h3>
            <p>
              Upload documents and chat with them. Instantly retrieve answers
              from large PDFs using AI search.
            </p>

            <ul>
              <li>Upload multiple documents</li>
              <li>Semantic document search</li>
              <li>Context-aware AI responses</li>
              <li>Fast knowledge retrieval</li>
            </ul>
          </div>


          <div className="card">
            <div className="icon">💬</div>
            <h3>Discussion Forum</h3>
            <p>
              Ask questions, share knowledge, and collaborate with the
              community to solve problems.
            </p>

            <ul>
              <li>Post questions</li>
              <li>Community answers</li>
              <li>Knowledge sharing</li>
              <li>Collaborative discussions</li>
            </ul>
          </div>

        </div>

      </section>


      {/* BENEFITS */}

      <section className="benefits">

        <h2>Why Use Our Platform</h2>

        <div className="benefitGrid">

          <div className="benefit">
            ⚡ Instant answers from websites and documents
          </div>

          <div className="benefit">
            📚 AI-powered learning experience
          </div>

          <div className="benefit">
            🤝 Community collaboration
          </div>

          <div className="benefit">
            🔎 Faster information discovery
          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="cta">

        <h2>Start Exploring Today</h2>

        <p>
          Use Web Copilot to interact with websites, documents, and community
          knowledge effortlessly.
        </p>

        <Link href="/dashboard">
          <button className="ctaBtn">Go to Dashboard</button>
        </Link>

      </section>


      <style jsx>{`

        .page{
          background:linear-gradient(135deg,#020617,#0f172a,#1e293b);
          color:white;
          min-height:100vh;
        }

        /* HERO */

        .hero{
          text-align:center;
          padding:120px 20px 80px 20px;
          max-width:900px;
          margin:auto;
        }

        .hero h1{
          font-size:52px;
          font-weight:700;
          margin-bottom:20px;
          background:linear-gradient(90deg,#22c55e,#4ade80);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
        }

        .hero p{
          font-size:20px;
          opacity:0.85;
          margin-bottom:30px;
        }

        .heroBtn{
          padding:14px 28px;
          border:none;
          border-radius:10px;
          font-size:16px;
          font-weight:600;
          cursor:pointer;
          background:linear-gradient(135deg,#22c55e,#4ade80);
          color:#052e16;
        }


        /* FEATURES */

        .features{
          padding:80px 30px;
          text-align:center;
        }

        .features h2{
          font-size:34px;
          margin-bottom:50px;
        }

        .featureGrid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
          gap:35px;
          max-width:1100px;
          margin:auto;
        }

        .card{
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(10px);
          padding:30px;
          border-radius:16px;
          text-align:left;
          transition:all 0.3s ease;
          border:1px solid rgba(255,255,255,0.08);
        }

        .card:hover{
          transform:translateY(-8px);
          background:rgba(255,255,255,0.08);
        }

        .icon{
          font-size:32px;
          margin-bottom:12px;
        }

        .card h3{
          margin-bottom:10px;
          font-size:20px;
        }

        .card p{
          opacity:0.85;
        }

        .card ul{
          margin-top:12px;
          padding-left:18px;
          opacity:0.75;
        }


        /* BENEFITS */

        .benefits{
          padding:80px 30px;
          text-align:center;
        }

        .benefits h2{
          font-size:34px;
          margin-bottom:40px;
        }

        .benefitGrid{
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
          gap:20px;
          max-width:900px;
          margin:auto;
        }

        .benefit{
          background:rgba(255,255,255,0.05);
          padding:20px;
          border-radius:12px;
          font-size:16px;
          transition:0.3s;
        }

        .benefit:hover{
          background:rgba(255,255,255,0.1);
        }


        /* CTA */

        .cta{
          padding:100px 20px;
          text-align:center;
        }

        .cta h2{
          font-size:36px;
          margin-bottom:10px;
        }

        .cta p{
          opacity:0.85;
        }

        .ctaBtn{
          margin-top:25px;
          padding:14px 30px;
          border:none;
          border-radius:12px;
          font-size:16px;
          font-weight:600;
          background:linear-gradient(135deg,#22c55e,#4ade80);
          color:#052e16;
          cursor:pointer;
        }

      `}</style>

    </div>
  );
}