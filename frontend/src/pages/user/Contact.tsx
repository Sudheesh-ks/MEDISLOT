import { assets } from '../../assets/user/assets';

const Contact = () => (
  <main className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
    <h1 className="text-center text-3xl md:text-4xl font-extrabold mb-16">
      CONTACT{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600">
        US
      </span>
    </h1>

    <section className="flex flex-col md:flex-row gap-12 mb-32">
      <img
        src={assets.contact_image}
        alt="Contact MediSlot"
        className="w-full md:max-w-sm rounded-3xl ring-1 ring-white/10 object-cover"
      />

      <div className="flex flex-col justify-center gap-6 text-sm text-slate-400">
        <h2 className="text-lg font-semibold text-slate-100">Our Office</h2>
        <p>54709 Willms Station Suite 350, Washington USA</p>

        <p>
          Tel: <a href="tel:+14155550132" className="hover:text-cyan-400">(415) 555‑0132</a>
          <br />
          Email:{' '}
          <a
            href="mailto:medislot@gmail.com"
            className="hover:text-cyan-400"
          >
            medislot@gmail.com
          </a>
        </p>

        <h2 className="text-lg font-semibold text-slate-100">
          Careers at MediSlot
        </h2>
        <p>Learn more about our teams and open roles.</p>

        <button
          className="mt-2 self-start bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white px-8 py-3 rounded-full hover:-translate-y-0.5 transition-transform"
          onClick={() => window.open('https://medislot.com/careers', '_blank')}
        >
          Explore Jobs
        </button>
      </div>
    </section>
  </main>
);

export default Contact;
