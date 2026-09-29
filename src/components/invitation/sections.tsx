import Image from "next/image";
import { AtSign, CalendarPlus, Clock, MapPin } from "lucide-react";
import { ArchPhoto, CornerFrame, Divider, FloatingOrnament, SectionTitle, Star8 } from "@/components/ornaments";
import { Parallax, Reveal, Scrub, SplitText } from "@/components/reveal";
import { wedding, type WeddingEvent } from "@/data/wedding";
import { dateParts, formatLongDate, googleCalendarUrl } from "@/lib/format";
import { photo } from "@/lib/photos";
import type { Wish } from "@/lib/types";
import { Countdown } from "./countdown";
import { Gallery } from "./gallery";
import { GiftButton } from "./gift-modal";
import { LoveStory } from "./love-story";
import { WishList } from "./wish-list";

const names = `${wedding.bride.nickname} & ${wedding.groom.nickname}`;

/**
 * Setiap section naik menimpa section sebelumnya: margin negatif + sudut atas membulat.
 * Section yang muncul belakangan di DOM otomatis tergambar di atas yang sebelumnya.
 */
const panel = "relative -mt-10 rounded-t-[2.5rem] shadow-[0_-18px_40px_-22px_rgba(107,77,85,0.35)]";
const shell = "bg-motif bg-shell";

export function Hero() {
  const hero = photo(wedding.photos.hero);
  const firstEvent = wedding.events[0];
  return (
    <section id="home" className="relative flex min-h-dvh flex-col">
      {/* Foto membesar perlahan & bergerak lebih lambat dari scroll. Bagian bawahnya memudar
          lewat mask, jadi tidak pernah ada tepi foto yang terlihat terpotong. */}
      <div className="relative h-[64dvh] min-h-[440px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent_98%)]">
        <Scrub className="absolute inset-0" offset={["start start", "end start"]} scale={[1, 1.12]}>
          <Parallax className="absolute inset-0" offset={60}>
            <Image
              src={hero.src}
              alt={names}
              fill
              preload
              sizes="(max-width: 440px) 100vw, 440px"
              placeholder="blur"
              blurDataURL={hero.blurDataURL}
              className="object-cover object-[50%_35%]"
            />
          </Parallax>
        </Scrub>
      </div>
      <div className="relative -mt-32 flex flex-1 flex-col items-center px-6 pb-36 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-mauve">
          <SplitText text="Wilujeng Sumping" by="letter" />
        </p>
        <Reveal variant="down" delay={0.3}>
          <p className="mt-3 font-serif text-lg italic text-plum">The Wedding of</p>
        </Reveal>
        <h1 className="font-script text-6xl leading-tight text-plum">
          <SplitText text={names} delay={0.45} stagger={0.15} />
        </h1>
        <Reveal variant="zoom" delay={0.8}>
          <Divider className="my-3" />
          <p className="font-serif text-lg font-medium text-ink">{formatLongDate(wedding.date)}</p>
        </Reveal>
        <div className="mt-7">
          <Countdown date={wedding.date} />
          <Reveal variant="rise" delay={1}>
            <a
              href={googleCalendarUrl({
                title: `Pernikahan ${names}`,
                start: wedding.date,
                details: `${firstEvent.title} ${firstEvent.time}`,
                location: firstEvent.address || firstEvent.venue,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-plum/30 bg-white/70 px-5 py-2.5 text-xs font-medium text-plum transition hover:bg-blush"
            >
              <CalendarPlus className="size-4" />
              Simpan ke Kalender
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Opening() {
  const quote = photo(wedding.photos.quote);
  return (
    <section className={`${panel} ${shell} px-7 pt-20 pb-28 text-center`}>
      <FloatingOrnament className="-top-8 right-8 size-16" />
      <CornerFrame className="size-20" />
      <Reveal variant="zoom">
        <p className="font-arabic text-3xl leading-loose text-plum" lang="ar" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
      </Reveal>
      <Scrub rotate={[-8, 6]} className="my-10">
        <Reveal variant="mask" duration={1.3}>
          <ArchPhoto photo={quote} alt="Cincin pernikahan" className="w-44" sizes="180px" />
        </Reveal>
      </Scrub>
      <Reveal variant="rise">
        <p className="font-arabic text-xl leading-[2.3] text-plum" lang="ar" dir="rtl">
          وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ
          إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
        </p>
      </Reveal>
      <p className="mt-6 font-serif text-[17px] italic leading-relaxed text-ink">
        <SplitText
          text="“Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.”"
          stagger={0.025}
        />
      </p>
      <Reveal variant="flip" delay={0.2}>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-mauve">QS. Ar-Rum : 21</p>
      </Reveal>
    </section>
  );
}

type Person = (typeof wedding)["bride"] | (typeof wedding)["groom"];

function PersonCard({ person, side }: { person: Person; side: "bride" | "groom" }) {
  return (
    <div className="text-center">
      <Scrub rotate={side === "bride" ? [-5, 3] : [5, -3]} className="relative mx-auto w-56">
        <Reveal variant="mask" duration={1.3}>
          <ArchPhoto
            photo={photo(person.photo)}
            alt={person.fullName}
            className="w-full"
            sizes="240px"
            position={side === "bride" ? "50% 20%" : "50% 25%"}
            fade
          />
        </Reveal>
      </Scrub>
      {/* Nama panggilan menumpuk di bagian bawah foto */}
      <Reveal variant={side === "bride" ? "left" : "right"} delay={0.4} className="relative z-10 -mt-12">
        <h3 className="font-script text-7xl text-plum [text-shadow:0_0_14px_#fbf6f2,0_0_4px_#fbf6f2,0_0_2px_#fbf6f2]">
          {person.nickname}
        </h3>
      </Reveal>
      <p className="mt-1 font-serif text-2xl font-semibold text-ink">
        <SplitText text={person.fullName} delay={0.5} />
      </p>
      <Reveal variant="flip" delay={0.3}>
        <p className="mx-auto mt-2 max-w-72 text-sm leading-relaxed text-mauve">{person.parents}</p>
        {person.instagram && (
          <a
            href={`https://instagram.com/${person.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-1.5 text-xs text-cream"
          >
            <AtSign className="size-3.5" />
            {person.instagram}
          </a>
        )}
      </Reveal>
    </div>
  );
}

export function Couple() {
  return (
    <section id="mempelai" className={`${panel} bg-cream px-7 pt-20 pb-28`}>
      <FloatingOrnament className="-top-7 left-8 size-14" spin={-220} />
      <div className="mb-14 text-center">
        <Reveal variant="flip">
          <p className="font-serif text-xl font-medium text-plum">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-4 text-sm leading-relaxed">
            Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho
            Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami:
          </p>
        </Reveal>
      </div>
      <PersonCard person={wedding.bride} side="bride" />
      <div className="my-12 flex items-center justify-center gap-4 text-gold">
        <Scrub x={[-50, 0]} offset={["start end", "center 85%"]}>
          <span className="block h-px w-16 bg-gold/60" />
        </Scrub>
        <Scrub rotate={[-120, 0]} scale={[0.4, 1]} offset={["start end", "center 85%"]}>
          <span className="block font-script text-7xl text-rose">&</span>
        </Scrub>
        <Scrub x={[50, 0]} offset={["start end", "center 85%"]}>
          <span className="block h-px w-16 bg-gold/60" />
        </Scrub>
      </div>
      <PersonCard person={wedding.groom} side="groom" />
    </section>
  );
}

export function LoveStorySection() {
  const items = wedding.loveStory.map((s) => ({ ...s, photo: s.photo ? photo(s.photo) : null }));
  return (
    <section id="cerita" className={`${panel} ${shell} px-5 pt-20 pb-28`}>
      <FloatingOrnament className="-top-8 right-10 size-16" spin={260} />
      <SectionTitle eyebrow="Our Journey" title="Love Story" backdrop="Our Story" />
      <LoveStory items={items} />
    </section>
  );
}

function EventCard({ event }: { event: WeddingEvent }) {
  const { weekday, day, monthYear } = dateParts(event.date);
  return (
    <article className="relative rounded-t-[999px] rounded-b-3xl border border-gold/40 bg-[#fffdfb] px-6 pt-16 pb-8 text-center shadow-[0_-10px_30px_-12px_rgba(107,77,85,0.3)]">
      <Scrub rotate={[0, 180]} className="absolute top-6 left-1/2 -ml-3.5 size-7">
        <Star8 className="size-7 text-gold" />
      </Scrub>
      <h3 className="font-script text-5xl text-plum">
        <SplitText text={event.title} />
      </h3>
      <div className="mx-auto mt-5 flex w-fit items-center gap-4 text-plum">
        <Reveal variant="left" delay={0.2}>
          <span className="font-serif text-lg">{weekday}</span>
        </Reveal>
        <Reveal variant="pop" delay={0.3}>
          <span className="block border-x border-gold/60 px-4 font-serif text-5xl font-semibold">{day}</span>
        </Reveal>
        <Reveal variant="right" delay={0.2}>
          <span className="block w-20 text-left font-serif text-lg leading-tight">{monthYear}</span>
        </Reveal>
      </div>
      <Reveal variant="up" delay={0.35}>
        <p className="mt-5 flex items-center justify-center gap-2 text-sm">
          <Clock className="size-4 text-mauve" />
          {event.time}
        </p>
        <p className="mt-4 font-serif text-xl font-semibold text-ink">{event.venue}</p>
        {event.address && <p className="mt-1 text-sm leading-relaxed text-mauve">{event.address}</p>}
        {event.mapsUrl ? (
          <a
            href={event.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-xs font-medium text-cream shadow transition hover:bg-mauve"
          >
            <MapPin className="size-4" />
            Lihat Lokasi
          </a>
        ) : (
          <p className="mt-6 text-xs italic text-mauve">Link lokasi menyusul</p>
        )}
      </Reveal>
    </article>
  );
}

export function Events() {
  return (
    <section id="acara" className={`${panel} bg-cream px-6 pt-20 pb-28`}>
      <FloatingOrnament className="-top-7 left-10 size-14" spin={-180} />
      <CornerFrame className="size-16" />
      <SectionTitle eyebrow="Save the Date" title="Waktu & Tempat" backdrop="Save the Date" />
      {/* Kartu menempel (sticky) lalu kartu berikutnya naik menumpuk di atasnya */}
      <div className="space-y-8">
        {wedding.events.map((event, i) => (
          <div key={event.title} className="sticky" style={{ top: 72 + i * 32 }}>
            <Reveal variant={i % 2 === 0 ? "flip" : "rise"} delay={i * 0.1}>
              <EventCard event={event} />
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GallerySection() {
  return (
    <section id="galeri" className={`${panel} ${shell} px-4 pt-20 pb-28`}>
      <FloatingOrnament className="-top-8 right-8 size-16" spin={200} />
      <SectionTitle eyebrow="Our Moments" title="Galeri" backdrop="Moments" />
      <Reveal variant="scale" delay={0.1}>
        <Gallery photos={wedding.photos.gallery.map(photo)} alt={names} />
      </Reveal>
    </section>
  );
}

export function RsvpSection({ form, wishes }: { form: React.ReactNode; wishes: Wish[] }) {
  return (
    <section id="rsvp" className={`${panel} bg-cream px-5 pt-20 pb-28`}>
      <FloatingOrnament className="-top-7 left-8 size-14" spin={-240} />
      <SectionTitle eyebrow="RSVP" title="Ucapan & Doa" backdrop="Wishes" />
      <Reveal variant="flip">
        <p className="-mt-4 mb-8 text-center text-sm leading-relaxed">
          Mohon konfirmasi kehadiran Anda paling lambat {formatLongDate(wedding.rsvpDeadline)}.
        </p>
      </Reveal>
      <Reveal variant="rise">{form}</Reveal>
      <Reveal variant="up" className="mt-8">
        {/* key: kembali ke halaman 1 saat ada ucapan baru */}
        <WishList key={wishes.length} wishes={wishes} />
      </Reveal>
    </section>
  );
}

export function GiftSection({ guestName }: { guestName: string | null }) {
  if (wedding.gifts.length === 0 && !wedding.giftAddress) return null;
  return (
    <section id="hadiah" className={`${panel} ${shell} px-6 pt-20 pb-28 text-center`}>
      <FloatingOrnament className="-top-8 right-10 size-16" spin={180} />
      <SectionTitle eyebrow="Wedding Gift" title="Amplop Digital" backdrop="Gift" />
      <Reveal>
        <p className="-mt-4 mb-10 text-sm leading-relaxed">
          Doa restu Anda merupakan karunia yang sangat berarti bagi kami. Namun jika memberi adalah ungkapan tanda kasih,
          Anda dapat memberi kado secara cashless.
        </p>
      </Reveal>
      <Reveal variant="pop" delay={0.1}>
        <GiftButton
          gifts={wedding.gifts}
          address={wedding.giftAddress}
          guestName={guestName}
          contacts={[
            { key: "bride", name: wedding.bride.nickname, phone: wedding.bride.whatsapp },
            { key: "groom", name: wedding.groom.nickname, phone: wedding.groom.whatsapp },
          ]}
        />
      </Reveal>
    </section>
  );
}

export function Closing() {
  const closing = photo(wedding.photos.closing);
  return (
    <section className={`${panel} overflow-hidden bg-plum`}>
      <Scrub className="relative h-[70dvh] min-h-[460px]" scale={[1.2, 1]} offset={["start end", "end end"]}>
        <Parallax className="absolute inset-0" offset={70}>
          <Image
            src={closing.src}
            alt={names}
            fill
            sizes="(max-width: 440px) 100vw, 440px"
            placeholder="blur"
            blurDataURL={closing.blurDataURL}
            className="object-cover object-[50%_40%]"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-45% to-plum" />
      </Scrub>
      <div className="relative -mt-44 px-7 pb-32 text-center text-cream">
        <Reveal variant="rise">
          <p className="text-sm leading-relaxed">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan
            memberikan doa restu. Atas kehadiran dan doa restunya, kami ucapkan terima kasih.
          </p>
        </Reveal>
        <p className="mt-6 font-serif text-2xl italic">
          <SplitText text="Hatur nuhun" by="letter" />
        </p>
        <Reveal variant="flip" delay={0.1}>
          <p className="mt-4 font-serif text-base">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh</p>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-cream/80">Kami yang berbahagia</p>
        </Reveal>
        <Scrub scale={[0.75, 1]} offset={["start end", "center 70%"]}>
          <p className="mt-2 font-script text-6xl">
            <SplitText text={names} stagger={0.15} delay={0.2} />
          </p>
        </Scrub>
      </div>
    </section>
  );
}
