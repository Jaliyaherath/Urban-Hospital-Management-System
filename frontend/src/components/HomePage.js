import img1 from '../images/img1.jpeg';
import img2 from '../images/img2.jpeg';
import img3 from '../images/img3.jpeg';
import logo from '../images/image1.jpeg';

const HomePage = () => {
  return (
    <div className="bg-blue-50 min-h-screen">
      <header className="bg-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to My Health Record
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            A safe and secure place to keep your key health information, available to you and your healthcare providers anytime, including in an emergency.
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="bg-white shadow-md rounded-lg p-6 mb-12">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-blue-700 mb-4">My Health Record</h2>
              <p className="text-gray-600 mb-6">
                A secure platform for managing your healthcare records. Access and share your health information with your doctors anytime.
              </p>
              <a href="/my-health-record" className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition-colors">
                Go to My Health Record
              </a>
            </div>
            <div>
              <img src={logo} alt="Health Records" className="h-48 w-48"/>
            </div>
          </div>
        </div>

        <section className="bg-white shadow-md rounded-lg p-6 mb-12">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Our Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <img src={img1} alt="Feature 1" className="h-32 w-32 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-gray-800">Laborotary Bookings</h3>
              <p className="text-gray-600">Just Click an Book your Lab Here</p>
            </div>
            <div className="text-center">
              <img src={img2} alt="Feature 2" className="h-32 w-32 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-gray-800">Treatment Booking</h3>
              <p className="text-gray-600">Experience your Treatment Now</p>
            </div>
            <div className="text-center">
              <img src={img3} alt="Feature 3" className="h-32 w-32 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-gray-800">Doctor Appointent</h3>
              <p className="text-gray-600">Meet Your Doctor Today</p>
            </div>
          </div>
        </section>

        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Contact Us</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="Your Name"/>
            </div>
            <div>
              <label className="block text-gray-700">Email</label>
              <input type="email" className="w-full px-4 py-2 border rounded-md" placeholder="Your Email"/>
            </div>
            <div>
              <label className="block text-gray-700">Message</label>
              <textarea className="w-full px-4 py-2 border rounded-md" rows="4" placeholder="Your Message"></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition-colors">
              Send Message
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default HomePage;