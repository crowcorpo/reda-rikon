import tinis from "./assets/lo.png"

function Tailwind() {
  return (
    <div className="bg-[#1b1b20] min-h-screen w-full overflow-x-hidden">
      <nav className="p-7">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-white">🏀 Fitness Pro</h1>

          <ul className="flex flex-wrap justify-center gap-4 text-white">
            <li><a href="#" className="hover:text-gray-300 font-bold text-sm">How It Works</a></li>
            <li><a href="#" className="hover:text-gray-300 font-bold text-sm">Features</a></li>
            <li><a href="#" className="hover:text-gray-300 font-bold text-sm">Stats & Reviews</a></li>
            <li><a href="#" className="hover:text-gray-300 font-bold text-sm">Download</a></li>
          </ul>

          <div className="text-white flex items-center gap-2 text-sm">
            Theme
            <div className="w-12 h-6 rounded-full bg-gray-500 cursor-pointer flex items-center justify-center text-xs">☀️🌙</div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto flex flex-col lg:flex-row lg:items-start px-4 pb-10">

        <div className="w-full lg:w-96 text-white mt-10 lg:mt-0 lg:ml-25 text-center lg:text-left">

          <p className="font-bold mb-4 text-sm text-gray-600">TRAIN SMARTER. GET STRONGER</p>
          <h2 className="text-3xl lg:text-5xl font-bold mb-4">Simple fitness exercises for everyone.</h2>
          <p className="text-xs mb-6 text-gray-600">Track your workouts, get better results, and be the best version of you, less thinking, more lifting.</p>

          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
            <button className="bg-[#ff2600] font-semibold text-xs cursor-pointer text-white px-4 py-2 rounded-2xl hover:bg-[#ff4c4c] transition duration-300">Download App</button>
            <button className="border border-white font-semibold text-xs cursor-pointer text-white px-4 py-2 rounded-2xl hover:bg-white hover:text-black transition duration-300">Book a Class</button>
          </div>
        </div>

        <div className="w-full lg:w-auto mt-8 lg:mt-0 lg:-top-19">
          <img src={tinis} className="w-full object-contain" />
        </div>

      </div>
    </div>
  );
}

export default Tailwind;