"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { FC, useEffect, useRef, useState } from "react";
import { api } from "../convex/_generated/api";
import type { Rsvp } from "../convex/rsvp";

export default function App() {
  const { signIn, signOut } = useAuthActions();
  const [signInStep, setSignInStep] = useState<"init" | "otp">("init");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [rsvp, setRsvp] = useState<Rsvp>({
    name: "",
    rsvp: "going",
  });
  const user = useQuery(api.users.getCurrentUser);
  const learnings = useQuery(api.fun.getLearnings);
  const upsertRsvp = useMutation(api.rsvp.upsertRsvp);
  const serverRsvp = useQuery(api.rsvp.getRsvp);
  const serverRsvpRef = useRef<Rsvp>(null);
  const isServerRsvpSet = Boolean(serverRsvp);
  const guests = useQuery(api.rsvp.getGuests);
  const going = guests ? guests.filter((guest) => guest.rsvp === "going") : [];
  const maybe = guests ? guests.filter((guest) => guest.rsvp === "maybe") : [];
  const notGoing = guests
    ? guests.filter((guest) => guest.rsvp === "not going")
    : [];
  const upsertTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (rsvp.name.trim()) {
      // debounce mutation calls
      if (upsertTimeoutRef.current) {
        clearTimeout(upsertTimeoutRef.current);
      }
      upsertTimeoutRef.current = setTimeout(async () => {
        await upsertRsvp(rsvp);
      }, 500);
    }
  }, [rsvp, upsertRsvp]);

  const isSelected = (kind: Rsvp["rsvp"]) => rsvp.rsvp === kind;

  useEffect(() => {
    if (serverRsvp) {
      serverRsvpRef.current = serverRsvp;
    }
  }, [isServerRsvpSet, serverRsvp]);

  useEffect(() => {
    void (async () => {
      if (isServerRsvpSet) {
        if (serverRsvpRef.current) {
          setRsvp(serverRsvpRef.current);
        }
      } else {
        setSignInStep("init");
      }
    })();
  }, [isServerRsvpSet]);

  return (
    <>
      <CursorSparkler />
      <main className="p-8 flex flex-col gap-16 max-w-5xl m-auto">
        <section className="max-w-prose mx-auto w-full mt-8">
          <span className="font-bold">nostalgic </span>
          for the days of <Nostalgia />? come join us in
        </section>
        <section>
          <h1 className="font-[EB_Garamond] text-8xl tracking-tight text-right">
            Coding by <span className="text-9xl font-[Mea_Culpa]">Hand</span>
          </h1>
          <p className="text-right">i.e., without ai*</p>
          <img src="/happy.gif" className="h-28 w-28 ml-auto"></img>
        </section>
        <section className="mx-auto text-center">
          <p className="font-bold">sat, october 3, 2026</p>
          <Unauthenticated>
            <p>rsvp for address!</p>
          </Unauthenticated>
          <Authenticated>
            <p>beacon house! 1354 florida st, sf</p>
          </Authenticated>
          <p>
            <span className="font-bold">1pm</span> coding
          </p>
          <p>
            <span className="font-bold">3pm</span> show & tell
          </p>
        </section>
        <section className="max-w-prose text-justify mx-auto w-full">
          <p>
            <span className="font-bold">programming</span> has always been a
            form of art. this is even more true, now that software engineering
            is increasingly automated. as with any craft, there’s much we can
            learn through gaining deep familiarity with our tools:
          </p>
          <ul className="list-disc list-inside">
            <li>thinking within the structure of a programming language</li>
            {learnings && learnings.map((learning) => <li>{learning}</li>)}
          </ul>
        </section>
        <Authenticated>
          <section className="max-w-prose mx-auto w-full">
            {going.length > 0 && (
              <>
                <p className="font-bold">going!</p>
                <ul>
                  {going.map((guest) => (
                    <li>
                      {guest.name}
                      {guest.pronouns ? ` (${guest.pronouns})` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {maybe.length > 0 && (
              <>
                <p className="font-bold">maybe going</p>
                <ul>
                  {maybe.map((guest) => (
                    <li>
                      {guest.name}
                      {guest.pronouns ? ` (${guest.pronouns})` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {notGoing.length > 0 && (
              <>
                <p className="font-bold">not going :(</p>
                <ul>
                  {notGoing.map((guest) => (
                    <li>
                      {guest.name}
                      {guest.pronouns ? ` (${guest.pronouns})` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </Authenticated>
        <section className="max-w-prose mx-auto w-full">
          <p className="font-bold">rsvp</p>
          <Unauthenticated>
            <p>
              <span className="font-bold">what's your email?</span> my email is{" "}
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={signInStep !== "init"}
              ></input>
              {signInStep === "init" && (
                <>
                  {" "}
                  <button
                    onClick={() => {
                      void signIn("resend-otp", { email }).then(() =>
                        setSignInStep("otp"),
                      );
                    }}
                    className="hover:cursor-pointer"
                  >
                    <span className="hover:opacity-100 transition opacity-60">
                      [verify]
                    </span>
                  </button>
                </>
              )}
              .
            </p>
            {signInStep === "otp" && (
              <p>
                <span className="font-bold">what's your otp code?</span> my otp
                is{" "}
                <input
                  className="border-dotted dark:border-light border-dark border-b-2"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                ></input>
                <button
                  onClick={() => {
                    void signIn("resend-otp", { email, code });
                  }}
                  className="hover:cursor-pointer"
                >
                  <span className="hover:opacity-100 transition opacity-60">
                    [verify]
                  </span>
                </button>
                .
              </p>
            )}
            <p className="opacity-60">
              already rsvped? sign-in to view the guest list and edit your
              response.
            </p>
          </Unauthenticated>
          <Authenticated>
            <p>
              <span className="font-bold">what's your email?</span> my email is{" "}
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                disabled
                value={user?.email}
              ></input>{" "}
              <button
                onClick={() => {
                  void signOut();
                }}
                className="hover:cursor-pointer"
              >
                <span className="hover:opacity-100 transition opacity-60">
                  [sign-out]
                </span>
                .
              </button>
            </p>
            <p>
              <span className="font-bold">are you in?</span> i am{" "}
              <button
                onClick={() => setRsvp({ ...rsvp, rsvp: "going" })}
                className={`${!isSelected("going") ? "hover:cursor-pointer" : ""}`}
              >
                <span
                  className={`hover:opacity-100 transition ${!isSelected("going") ? "opacity-60" : ""}`}
                >
                  [going]
                </span>
              </button>
              /
              <button
                onClick={() => setRsvp({ ...rsvp, rsvp: "maybe" })}
                className={`${!isSelected("maybe") ? "hover:cursor-pointer" : ""}`}
              >
                <span
                  className={`hover:opacity-100 transition ${!isSelected("maybe") ? "opacity-60" : ""}`}
                >
                  [maybe going]
                </span>
              </button>
              /
              <button
                onClick={() => setRsvp({ ...rsvp, rsvp: "not going" })}
                className={`${!isSelected("not going") ? "hover:cursor-pointer" : ""}`}
              >
                <span
                  className={`hover:opacity-100 transition ${!isSelected("not going") ? "opacity-60" : ""}`}
                >
                  [not going]
                </span>
              </button>
              .
            </p>

            <div>
              <label>
                <span className="font-bold">what name do you go by? </span>
                my name is
              </label>{" "}
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={rsvp.name}
                onChange={(event) =>
                  setRsvp({ ...rsvp, name: event.target.value })
                }
              ></input>{" "}
              <span className="opacity-60">(required)</span>.
            </div>
            <div>
              <label>
                <span className="font-bold">what are your pronouns?</span> my
                pronouns are{" "}
              </label>
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={rsvp.pronouns}
                onChange={(event) =>
                  setRsvp({ ...rsvp, pronouns: event.target.value })
                }
              ></input>
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  what do you miss (or don’t miss!) about coding by hand?
                </span>{" "}
                i miss{" "}
              </label>
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={rsvp.memory}
                onChange={(event) =>
                  setRsvp({ ...rsvp, memory: event.target.value })
                }
              ></input>
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  what are you excited to learn or practice?{" "}
                </span>{" "}
                i'm excited to learn about{" "}
              </label>
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={rsvp.learning}
                onChange={(event) =>
                  setRsvp({ ...rsvp, learning: event.target.value })
                }
              ></input>
              .
            </div>
            <div>
              <label>
                <span className="font-bold">
                  do you have any dietary preferences?
                </span>{" "}
                my dietary preferences are{" "}
              </label>
              <input
                className="border-dotted dark:border-light border-dark border-b-2"
                value={rsvp.dietaryPrefs}
                onChange={(event) =>
                  setRsvp({ ...rsvp, dietaryPrefs: event.target.value })
                }
              ></input>
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
        <section className="ml-auto opacity-60">
            <p>
              *not an anti-ai event! woo hoo go ai! i love ai!!!1!!1
            </p>
          </section>
        <footer className="mx-auto">
          <section>
            <p>
              <a href="https://github.com/reeceyang/handcoding">made with ♡</a> by renee & powered by <a href="https://www.convex.dev/">convex</a>
            </p>
          </section>
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
      const dTop = -1 * Math.sin(angleRad);
      const dLeft = 1 * Math.cos(angleRad);
      setPos({
        left: left + dLeft,
        top: top + dTop,
      });
    }, 30);

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

function Nostalgia() {
  const nostalgia = useQuery(api.fun.getNostalgia);
  const [currentIndex, setCurrentIndex]= useState(0);
  const [tick, setTick] = useState(0);
  const [dTick, setDTick] = useState(1);

  useEffect(() => {
    if (!nostalgia) {
      return;
    }
    const currentMemory = nostalgia[currentIndex]?.trim();
    if (!currentMemory) {
      return;
    }
    const intervalId = setInterval(() => {
      let newDTick = dTick;
      if (tick > currentMemory.length + 12) {
        newDTick = -1;
      }
      if (tick <= 0) {
        setCurrentIndex((currentIndex + 1) % nostalgia.length);
        newDTick = 1;
      }
      setTick(tick + newDTick);
      setDTick(newDTick);
    }, 50);

    return () => {
      clearInterval(intervalId);
    }
  }, [currentIndex, dTick, nostalgia, tick]);

  if (!nostalgia || nostalgia.length === 0) {
    return "";
  }

  const currentMemory = nostalgia[currentIndex]?.trim();

  return currentMemory.slice(0, Math.max(Math.min(tick, currentMemory.length), 0));
}
