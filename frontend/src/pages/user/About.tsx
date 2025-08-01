import { assets } from '../../assets/user/assets';

const About = () => (
  <main className="max-w-7xl mx-auto px-4 md:px-10 py-24 text-slate-100 animate-fade">
    {/* Heading */}
    <h1 className="text-center text-3xl md:text-4xl font-extrabold mb-16">
      ABOUT{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600">
        US
      </span>
    </h1>

    {/* Who we are */}
    <section className="flex flex-col md:flex-row gap-12 mb-24">
      <img
        src={assets.about_image}
        alt="About MediSlot"
        className="w-full md:max-w-sm rounded-3xl ring-1 ring-white/10 object-cover"
      />
      <div className="flex flex-col justify-center gap-6 text-sm text-slate-400 md:w-2/3">
        <p>
          Welcome to <span className="text-slate-100 font-semibold">MediSlot</span>, your trusted
          partner in managing healthcare needs conveniently and efficiently. We understand the
          challenges individuals face when it comes to scheduling doctor appointments and keeping
          track of medical records.
        </p>
        <p>
          We are committed to excellence in healthcare technology. By continuously integrating the
          latest advancements, we deliver a superior user experience. Whether you're booking your
          first appointment or managing ongoing care, MediSlot is here for you.
        </p>
        <h2 className="text-lg font-semibold text-slate-100">Our Vision</h2>
        <p>
          To create a seamless healthcare experience: bridging the gap between patients and
          providers so you can access the care you need — when you need it.
        </p>
      </div>
    </section>

    {/* Why choose us */}
    <h2 className="text-2xl font-extrabold mb-8 text-center">
      WHY{' '}
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-600">
        CHOOSE US
      </span>
    </h2>

    <section className="grid gap-6 md:grid-cols-3 mb-32">
      {[
        {
          title: 'Efficiency',
          text: 'Streamlined appointment scheduling that fits your busy lifestyle.',
        },
        {
          title: 'Convenience',
          text: 'Access a network of trusted healthcare professionals in your area.',
        },
        {
          title: 'Personalization',
          text: 'Tailored recommendations and reminders to keep you on top of your health.',
        },
      ].map(({ title, text }) => (
        <div
          key={title}
          className="bg-white/5 backdrop-blur ring-1 ring-white/10 px-8 py-14 rounded-3xl text-center hover:-translate-y-1 transition-transform cursor-default"
        >
          <h3 className="text-lg font-semibold text-slate-100 mb-3">{title}</h3>
          <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
        </div>
      ))}
    </section>
  </main>
);

export default About;
