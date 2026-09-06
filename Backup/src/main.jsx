import React from "react";
import {createRoot} from "react-dom/client";
import {Mail, Linkedin, Github, MapPin} from "lucide-react";
import "./styles.css";


const experience=[
  ["Samsung Electro-Mechanics","Frontend Engineer","Aug 2023 — Present"],
  ["Samsung Electro-Mechanics","UI/UX Developer Intern","Feb 2023 — Aug 2023"],
  ["Chegg","Chegg Expert","Apr 2022 — Jan 2023"]
];

function App(){
 return <div className="page page-load">


  <main>
   <section className="hero reveal reveal-1">
    <div className="identity reveal reveal-2">
      <div>
        {/* <img src="../public/visual.png" alt="" height={48} className="rounded" style={{borderRadius:'100%'}}/> */}
       <h4 className="!mb-2" style={{marginBottom:'10px'}}>Althaf Shaik</h4>
       <span style={{color:'#292929ad'}}>Software Engineer (Frontend)</span>
      </div>
        <img src="../public/visual.png" alt="" height={160} className="rounded" style={{
          borderRadius:'100%',
          border: '1px solid #ccc',}}/>
      {/* <div className="avatar">AS</div> */}
    </div>
 <div className="tagline reveal reveal-3" style={{textTransform:'uppercase',fontSize:'12px',color:'#292929ad'}}>
  Frontend engineer obsessed with detail
 </div>
    <div className="bio reveal reveal-4">
      <p>I'm a Frontend engineer with 3.5+ years of professional experience building web applications with React, JavaScript and TypeScript.</p>
      <p>I enjoy turning complex requirements into clean, responsive interfaces and working across UI components, REST APIs, application data flows and frontend deployment.</p>
      <p>Currently, I'm working as a Frontend Engineer <span style={{fontWeight:'500'}}>@ Samsung Electro-Mechanics.</span></p>
    </div>
    <div className="reach reveal reveal-5">
      You can reach me at althaf.sh658@gmail.com
    </div>

   </section>

   <section id="experience" className="block section-reveal">
    <div className="label">EXPERIENCE</div>
    {experience.map(([company,role,date], index)=><div className={`exp row-reveal row-${index+1}`} key={company+role}>
      <div className="company">{company}</div>
      <div className="role">{role}</div>
      <div className="date">{date}</div>
    </div>)}
   </section>

   <section id="skills" className="block section-reveal">
    <div className="label">SKILLS</div>
    <p className="skills">React.js · JavaScript · TypeScript · HTML · CSS · Tailwind CSS · React Router · REST APIs · Swagger / OpenAPI · Git · Vite · IIS</p>
   </section>

   <section id="contact" className="block contact section-reveal">
    <div className="label">CONTACT</div>
  
    <div className="links">

      <a href="mailto:althaf.sh658@gmail.com"><Mail/>Email</a>
      <a href="https://linkedin.com/in/althaf-shaik-658138229/" target="_blank" rel="noreferrer"><Linkedin/>LinkedIn</a>
      <a href="https://github.com/" target="_blank" rel="noreferrer"><Github/>GitHub</a>
      {/* and my atached resume
      <a href="/resume.pdf">Resume</a> */}
    </div>
   </section>
  </main>

  <footer><span>© 2026 Althaf Shaik</span><span>Frontend Engineer</span></footer>
 </div>
}
createRoot(document.getElementById("root")).render(<App/>);