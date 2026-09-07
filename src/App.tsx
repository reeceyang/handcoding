"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { FC, useEffect, useRef, useState } from "react";

export default function App() {
  return (
    <>
      <CursorSparkler />
      <main className="p-8 flex flex-col gap-16 max-w-5xl m-auto">
        <section className="max-w-prose mx-auto w-full mt-8">
          <span className="font-bold">nostalgic </span>
          for the days of typing semicolons? then please join us in
        </section>
        <section>
          <h1 className="font-[EB_Garamond] text-8xl tracking-tight text-right">
            Coding by <span className="text-9xl font-[Mea_Culpa]">Hand</span>
          </h1>
          <p className="text-right">i.e., without ai*</p>
          <img src="/happy.gif" className="h-28 w-28 ml-auto"></img>
        </section>
        <section className="mx-auto text-center">
          <p>on september 20, 2026, at 1pm.</p>
          <p>rsvp for address!</p>
        </section>
        <section className="max-w-prose text-justify mx-auto w-full">
          <p>
            <span className="font-bold">programming</span> has always been a
            form of art. this is even more true, now that software engineering
            is increasingly automated. as with any craft, there’s much we can
            learn by gaining deep familiarity with our tools:
          </p>
          <ul className="list-disc list-inside">
            <li>thinking within the structure of a programming language</li>
            <li>slowing down and coding more deliberately</li>
            <li>feeling the satisfaction of your project coming to life</li>
          </ul>
        </section>
        <section className="max-w-prose mx-auto w-full">
          <Unauthenticated>
            email (verify) already rsvped? sign-in to view the guest list
          </Unauthenticated>
          <Authenticated>
            <p className="font-bold">guests</p>
          </Authenticated>
        </section>
        <section className="max-w-prose mx-auto">
          <Unauthenticated>
            email (verify) already rsvped? sign-in to view the guest list
          </Unauthenticated>
          <Authenticated>
            <p className="font-bold">rsvp</p>
            <p>
              <span className="font-bold">what's your email?</span> my email is{" "}
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              <span className="opacity-80">(required)</span>.
            </p>
            <div>
              <label>
                <span className="font-bold">what name do you go by? </span>
                my name is
              </label>{" "}
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              <span className="opacity-80">(required)</span>.
            </div>
            <div>
              <label>
                <span className="font-bold">what are your pronouns?</span> my
                pronouns are{" "}
              </label>
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  what do you miss (or don’t miss!) about coding by hand?
                </span>{" "}
                i miss{" "}
              </label>
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  what are you excited to learn or practice?{" "}
                </span>{" "}
                i'm excited to learn about{" "}
              </label>
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  do you have any dietary preferences?
                </span>{" "}
                my dietary preferences are{" "}
              </label>
              <input className="border-dotted dark:border-light border-dark border-b-2"></input>{" "}
              .
            </div>
          </Authenticated>
        </section>
        <section className="max-w-prose w-full mx-auto">
          <h2 className="font-bold">faq</h2>
          <ul className="list-disc list-inside">
            <li>
              can i use ai to <span className="italic">xyz?</span>
            </li>
          </ul>
          <p>
            up to you! do what you think is in line with the spirit of the
            event.
          </p>
        </section>
        <footer className="ml-auto">
          *not an anti-ai event! woo hoo go ai! i love ai!!!1!!1
        </footer>
      </main>
    </>
  );
}

const SPARKLES = "`·.₊✩‧₊˚౨ৎ˚₊✩‧₊ ݁₊⟡˚˖⊹✧˖°.⋆˙⟡₊˚⊹♡★⭑⋆˚࿔";

interface Pos {
  left: number;
  top: number;
}

interface Particle {
  id: number;
  initalPos: Pos;
  angleRad: number;
  char: string;
}

function CursorSparkler() {
  const particlesRef = useRef<Particle[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const cursorPos = useRef<Pos>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      cursorPos.current = {
        left: event.clientX,
        top: event.clientY,
      };
    };
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const pos = cursorPos.current;
      if (!pos) {
        return;
      }
      if (particlesRef.current.length >= 10) {
        particlesRef.current.splice(0, 1);
      }
      const createNewParticle = () => ({
        id: Date.now(),
        initalPos: pos,
        angleRad: ((1 + (Math.random() - 0.5)) * Math.PI) / 3,
        char: SPARKLES.charAt(Math.floor(SPARKLES.length * Math.random())),
      });
      particlesRef.current.push(createNewParticle());
      setParticles(particlesRef.current.slice());
    }, 100);

    return () => {
      clearInterval(id);
    };
  });

  return particles.map(({ id, initalPos, angleRad, char }) => (
    <Sparkle initialPos={initalPos} angleRad={angleRad} char={char} key={id} />
  ));
}

const Sparkle: FC<{ initialPos: Pos; angleRad: number; char: string }> = ({
  initialPos,
  angleRad,
  char,
}) => {
  const [pos, setPos] = useState<Pos>(initialPos);

  useEffect(() => {
    const id = setInterval(() => {
      const { left, top } = pos;
      const dTop = -3 * Math.sin(angleRad);
      const dLeft = 3 * Math.cos(angleRad);
      setPos({
        left: left + dLeft,
        top: top + dTop,
      });
    }, 100);

    return () => {
      clearInterval(id);
    };
  });

  return (
    <div
      style={{
        top: Math.floor(pos.top),
        left: Math.floor(pos.left),
        position: "fixed",
        pointerEvents: "none",
      }}
    >
      {char}
    </div>
  );
};
