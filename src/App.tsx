import adam from '/adam.png'
import './App.css'

function App() {
  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-8
                font-sans text-gray-900
                md:pl-48">
  
      {/* Left vertical nav */}
      <aside className="flex flex-col space-y-2 text-blue-700 text-sm 
                  border-r border-slate-300 border-dotted 
                  md:fixed md:top-0 md:left-0 md:h-screen md:w-44
                  bg-[#fafcff] px-4 py-8">

        <a href="#about" className="hover:underline">about</a>
        <a href="#contact" className="hover:underline">contact</a>
        {/* <a href="#blog" className="hover:underline">blog</a> */}
        <a href="#talks" className="hover:underline">talks</a>

        <div className="border-l border-gray-300 my-3"></div>


        <div className="flex items-center w-full pr-4">
          <span className="mr-2 text-gray-600">adam online</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <a href="https://github.com/clevernyyyy" target="_blank" rel="noreferrer" className="hover:underline">github</a>
        <a href="https://twitter.com/clevernyyyy" target="_blank" rel="noreferrer" className="hover:underline">twitter</a>
        <a href="https://bsky.app/profile/appsec.bsky.social" target="_blank" rel="noreferrer" className="hover:underline">bluesky</a>
        <a href="https://offsec.sh" target="_blank" rel="noreferrer" className="hover:underline">resume</a>
       
        <div className="border-l border-gray-300 my-3"></div>

        <div className="flex items-center w-full pr-4">
          <span className="mr-2 text-gray-600">fun projects</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        <a href="https://nix.adamschaal.com" target="_blank" rel="noreferrer" className="hover:underline">nix</a>
        <a href="https://kernelcon.org" target="_blank" rel="noreferrer" className="hover:underline">kernelcon</a>
        <a href="https://dc402.org" target="_blank" rel="noreferrer" className="hover:underline">defcon402</a>
      </aside>

      {/* Main content */}
      <main className="prose prose-slate max-w-none">
        <h1 className="text-3xl mb-4">adam <b>schaal</b></h1>

        <img
          src={adam}
          alt="Adam Schaal"
          className="w-73 h-73 object-cover mb-6 border border-gray-300"
        />

        <section id="about">
          <h2 className="font-bold text-xl mb-2">about</h2>
          <p>
          I am the creator and leader of the AWS SHINE team (Security Hub of Innovation and Efficiency). My team and I research, experiment with, and develop mechanisms and constructs to reinforce security at scale using Generative AI and deterministic automation. SHINE is composed of a select group of highly skilled security and software engineers, responsible for driving major efficiency gains across all phases of the builder SDLC and the security review process.
          </p>
          <p className="mt-6">
          Previously, I served as a Principal Security Researcher and later as a Director at Contrast Security, where I worked extensively with real-time application self-protection at runtime (RASP) and interactive application security testing (IAST) technologies. As Director of Enterprise Security, I oversaw Product Security, Cloud Security, Security Operations, and Incident Response.
          </p>
          <p className="mt-6">
            I am an active member of the global cybersecurity community, frequently sharing my expertise at international conferences including BruCon, No Hat, Chaos Communication Camp, DEF CON, and The Linux Foundation Member Summit. I am also deeply involved in fostering the security community as an organizer of DEF CON 402, Kernelcon, and LocoMocoSec, helping create spaces for knowledge sharing and collaboration.
          </p>
          <p className="mt-6">
            I earned my MS in Cybersecurity from the University of Nebraska at Omaha, a National Center of Academic Excellence in Cybersecurity (NCAE‑C) designated by the NSA and DHS.
          </p>
        </section>

        <section id="contact" className="mt-10">
          <h2 className="font-bold text-xl mb-2">contact</h2>
          <p>
            The easiest way to reach me is via my email at <a href="mailto:me@adamschaal.com" className="text-blue-700 hover:underline">me@adamschaal.com</a>.
          </p>
        </section>

        {/* <section id="blog" className="mt-10">
          <h2 className="font-bold text-xl mb-2">blog</h2>
          <p>
            Check out my <a href="https://blog.adamschaal.com" target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">blog</a>.
          </p>
        </section>*/}

        <section id="talks" className="mt-10">
          <h2 className="font-bold text-xl mb-2">talks</h2>
          <p>Below are my conference appearances, shown in reverse chronological order.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><a href="https://www.brucon.org/conference" target="_blank" rel="noreferrer">BruCON 0x11</a>. September 26, 2025. Mechelen, Belgium.</li>
            <li><a href="https://www.shmoocon.org/speakers/#malwarecabal" target="_blank" rel="noreferrer">ShmooCon</a>. January 11, 2025. Washington D.C.</li>
            <li><a href="https://www.nohat.it/hall-of-fame" target="_blank" rel="noreferrer">No Hat Computer Security Conference</a>. October 19, 2024. Bergamo, Italy.</li>
            <li><a href="https://locomocosec.com" target="_blank" rel="noreferrer">LocoMoco Security Conference</a>. July 17, 2024. Kaua'i, Hawai'i.</li>
            <li><a href="https://events.ccc.de/camp/2023/infos" target="_blank" rel="noreferrer">Chaos Communication Camp</a>. August 17, 2023. Brandenburg, Germany.</li>
            <li><a href="https://lascon.org/past-lascon-2022" target="_blank" rel="noreferrer">LASCON 2022</a>. October 28, 2022. Austin, Texas.</li>
            <li><a href="https://events.linuxfoundation.org/archive/2021/lf-member-summit" target="_blank" rel="noreferrer">The Linux Foundation Member Summit</a>. November 2, 2021. Napa Valley, California.</li>
            <li><a href="https://lascon.org/past-lascon-2022" target="_blank" rel="noreferrer">LASCON 2021</a>. October 29, 2021. Austin, Texas.</li>
            <li><a href="https://blueteamcon.com/btc-history/blue-team-con-2021-schedule" target="_blank" rel="noreferrer">Blue Team Con</a>. August 29, 2021. Chicago, Illinois.</li>
            <li><a href="https://www.appsecvillage.com/events/dc-2021" target="_blank" rel="noreferrer">DEF CON 29 AppSec Village</a>. August 7, 2021. Las Vegas, Nevada.</li>
            <li><a href="https://absoluteappsec.com/cons/midwinter-2020" target="_blank" rel="noreferrer">Midwinter Night's Con</a> by Absolute AppSec. December 16, 2020. Remote.</li>
            <li><a href="https://www.bsidessatx.com/schedule-2020.html" target="_blank" rel="noreferrer">Bsides SATX</a>. July 11, 2020. San Antonio, Texas.</li>
            <li><a href="https://x.com/CircleCityCon" target="_blank" rel="noreferrer">Circle City Con</a>. June 14, 2020. Indianapolis, Indiana.</li>
            {/* <li><a href="" target="_blank" rel="noreferrer"></a></li>
            <li><a href="" target="_blank" rel="noreferrer"></a></li> */}
            <li><a href="http://www.bsidescha.com/bsides-chattanooga-agenda/#schaal" target="_blank" rel="noreferrer">Bsides Chattanooga</a>. April 18, 2020. Chattanooga, Tennessee</li>
            <li><a href="https://www.snowfroc.com" target="_blank" rel="noreferrer">SnowFroc</a>. March 12, 2020. Denver, Colorado.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
