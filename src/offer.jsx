import React from 'react';
import './offer.css';

import photo from "./assets/nate2.png";
import photo2 from "./assets/evi4.png";
import photo3 from "./assets/evi2.png";
import photo4 from "./assets/evi3.png";

export default function Offer() {
  const whatsappNumber = "213792148822"; 
  const whatsappMessage = encodeURIComponent("سلام عليكم، حاب نتحصل على الدليل الكامل لصناعة فيديوهات الـ AI.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="dark-page-container">
      {/* Top Header Bar */}
      <nav className="mini-nav">
        <div className="brand-logo">AI CREATOR<span>.</span></div>
        <div className="nav-tag">Reda Rikon</div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-headline-group">
          <span className="eyebrow-chip">الدليل الأكثر طلباً</span>
          <h1 className="hero-display-word">
            الدليل الكامل لصناعة <br />
            <span className="gradient-text">فيديوهات الـ AI</span>
          </h1>
        </div>

        {/* 3D Character Hero Card */}
        <div className="hero-stage-card">
          <div className="character-stage">
            <div className="arch-portal-glow"></div>
            <img 
              src={photo} 
              alt="3D AI Character" 
              className="character-cutout"
            />
          </div>

          <div className="hero-stage-content">
            <span className="mini-pill">إطلاق حصري</span>
            <h2 className="card-statement">طريقك نحو الانتشار وصناعة الدخل</h2>
            <p className="card-desc">
              حساب Instagram بمشاهدات عالية + مصدر دخل حقيقي بالدينار + شيء تفتخر به قدام صحابك.
            </p>

            <div className="hero-metrics-row">
              <div className="metric-chip">
                <span className="metric-num">+350K</span>
                <span className="metric-lbl">مشاهدة</span>
              </div>
              <div className="metric-chip">
                <span className="metric-num">100%</span>
                <span className="metric-lbl">بالذكاء الاصطناعي</span>
              </div>
              <div className="metric-chip">
                <span className="metric-num">0</span>
                <span className="metric-lbl">خبرة سابقة</span>
              </div>
            </div>

            <a href="#offer-details" className="scroll-btn">
              اكتشف محتوى الدليل ←
            </a>
          </div>
        </div>

        {/* Value Strip (Clean text tags, no icons) */}
        <div className="feature-pill-strip">
          <div className="pill-item">
            <span className="pill-title">توليد سريع</span>
            <span className="pill-sub">في دقائق</span>
          </div>
          <div className="pill-item">
            <span className="pill-title">قصص 3D</span>
            <span className="pill-sub">واقعية ومميزة</span>
          </div>
          <div className="pill-item">
            <span className="pill-title">قوالب Prompts</span>
            <span className="pill-sub">جاهزة للنسخ</span>
          </div>
        </div>

        {/* Intro Hook */}
        <div className="intro-hook-box">
          <p>
         إذا كنت تعاني من عدم نجاح فيديوهاتك على مواقع التواصل وما عندك حتى مصدر دخل من الإنترنت.. ودايمن ما تلقاش حاجة تتميز بيها و تفتاخر بيها 
            <strong> هادي ليك أنت</strong>، لأنو بعد ما تديها فيديواتك يجيبو مشاهدات عالية زايد نوريلك طرق لي تجيب بيهم دراهم.
          </p>
        </div>
      </header>

      {/* Main Problems Solved Section */}
      <section id="offer-details" className="content-card">
        <div className="section-title-wrap">
          <span className="section-badge">لماذا هذا الدليل؟</span>
          <h2 className="section-main-heading">كل العوائق محلولة مسبقاً</h2>
        </div>

        <div className="objections-stacked">
          {/* 01 */}
          <div className="glass-row">
            <span className="row-number">01</span>
            <div className="row-info">
              <h3>ما عندكش الوقت؟</h3>
              <p>الفيديو كامل يتولد في دقائق معدودة، ما تحتاج تقعد ساعات تصمم أو تجرب.</p>
            </div>
          </div>

          {/* 02 Proof Highlight */}
          <div className="glass-row featured-row">
            <span className="row-number">02</span>
            <div className="row-info">
              <h3>فشلت فالسوشل ميديا من قبل؟</h3>
              <p>هدا النوع ملقصص 3D ينجح وبمشاهدات خيالية، والأرقام واضحة تحت عينيك:</p>
              
              <div className="proof-grid">
                <div className="proof-frame">
                  <span className="frame-tag">إثبات 1</span>
                  <img src={photo3} alt="إثبات المشاهدات 1" />
                </div>
                <div className="proof-frame">
                  <span className="frame-tag">إثبات 2</span>
                  <img src={photo4} alt="إثبات الأرقام 2" />
                </div>
              </div>
            </div>
          </div>

          {/* 03 */}
          <div className="glass-row">
            <span className="row-number">03</span>
            <div className="row-info">
              <h3>خايف ملتعقيد؟</h3>
              <p>ما تحتاج حتى خبرة سابقة، الـ prompts  كامل جاهزين وكل الخطوات مشروحة بالتفصيل </p>
            </div>
          </div>

          {/* 04 */}
          <div className="glass-row">
            <span className="row-number">04</span>
            <div className="row-info">
              <h3>وقت طويل باش يكبر الحساب؟</h3>
              <p>الدليل يبدا معاك من أول فيديو، يوريلك كيفاش تنشر ونوع المحتوى لي يجيب مشاهدات باش ما تضيعش وقتك فالتجريب العشوائي.</p>
            </div>
          </div>
        </div>

        {/* Deliverables Box */}
        <div className="deliverables-glass-card">
          <div className="deliv-header">
            <h3>على ماذا ستحصل بالتفصيل؟</h3>
            <p>ملف html احترافي  يختصر عليك أشهر من التجريب</p>
          </div>

          <div className="deliv-items-list">
            <div className="deliv-item">
              <span className="clean-dot"></span>
              <span><strong>Prompts جاهزين:</strong> مع طريقة الاستخدام الصحيحة.</span>
            </div>
            <div className="deliv-item">
              <span className="clean-dot"></span>
              <span><strong>توليد الشخصيات والأماكن:</strong> أوامر احترافية مع الحفاظ على استمرارية الشكل.</span>
            </div>
            <div className="deliv-item">
              <span className="clean-dot"></span>
              <span><strong>سحر الـ Hooks:</strong> شرح عملي لكيفية جذب الانتباه والحفاظ على المشاهدات.</span>
            </div>
            <div className="deliv-item">
              <span className="clean-dot"></span>
              <span><strong>كيفية المونتاج:</strong> تجميع المقاطع وإخراج الفيديو بجودة احترافية.</span>
            </div>
            <div className="deliv-item">
              <span className="clean-dot"></span>
              <span><strong>طرق الربح الفعلي:</strong> الربح من اليوتيوب، السبونسور، وعقود Instagram.</span>
            </div>
            <div className="deliv-item">
              <span className="clean-dot"></span>
            </div>
          </div>

          {photo2 && (
            <div className="sample-showcase">
              <span className="sample-title">نموذج من جودة المحتوى:</span>
              <img src={photo2} alt="نموذج الجودة" className="sample-img" />
            </div>
          )}
        </div>

        {/* Guarantee Banner */}
        <div className="dark-guarantee-box">
          <h4>الضمان الشخصي المباشر</h4>
          <p>
            في حالة لم تصل إلى <strong>100 متابع</strong> و <strong>25 ألف مشاهدة</strong> في شهر: تدي مراجعة شخصية من عندي وتوجيه ومتابعة حتى توصل لـ <strong>1000 متابع</strong> و <strong> 100 ألف مشاهدة </strong>  <strong> + نحطك سطوري </strong>
          </p>
        </div>
      </section>

     {/* Pricing Section */}
      <section className="pricing-section">
        <div className="dark-price-card">
          <span className="ticket-tag"> سيختفي التخفيض بعد ايام</span>
          
          <div className="price-numbers">
            <span className="strike-price">6,900 DA</span>
            <div className="main-price">
              <span className="num">4,900</span>
              <span className="cur">د.ج (DA)</span>
            </div>
          </div>
          
          <p className="ticket-subtext">ملف الـ  Html يُرسل مباشرة عبر الواتساب فور تأكيد المعاملة.</p>

          {/* Compact WhatsApp Button */}
          <div className="cta-wrapper">
            <a 
  href={whatsappUrl}
  target="_blank" 
  rel="noopener noreferrer" 
  className="whatsapp-compact-btn"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    style={{ minWidth: '22px' }}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
  <span>تواصل عبر واتساب</span>
</a>
          </div>

          <div className="payment-badges">
            <span>BaridiMob متوفر</span>
            <span>•</span>
            <span>CCP متوفر</span>
            <span>•</span>
            <span>تسليم فوري ومباشر</span>
          </div>
        </div>
      </section>
    </div>
  );
}