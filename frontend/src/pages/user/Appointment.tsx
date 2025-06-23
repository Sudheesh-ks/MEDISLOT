import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { assets, type Doctor } from "../../assets/user/assets";
import RelatedDoctors from "../../components/user/RelatedDoctors";
import { toast } from "react-toastify";
import { appointmentBookingAPI, getAvailableSlotsAPI } from "../../services/appointmentServices";
import { showErrorToast } from "../../utils/errorHandler";
import { getDoctorSlotsAPI } from "../../services/doctorServices";


function parse12HourTime(timeStr: string): { hour: number; minute: number } {
  const [time, modifier] = timeStr.split(" ");
  const [hourStr, minuteStr] = time.split(":");

  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  if (modifier.toUpperCase() === "PM" && hour !== 12) {
    hour += 12;
  }
  if (modifier.toUpperCase() === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}


const Appointment = () => {
  type TimeSlot = {
    datetime: Date;
    time: string;
  };

  const navigate = useNavigate();
  const { docId } = useParams();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("TopDoctors must be used within an AppContextProvider");
  }

  const { doctors, currencySymbol, token, getDoctorsData } = context;
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState<Doctor | undefined | null>(null);
  const [docSlots, setDocSlots] = useState<TimeSlot[][]>([]);
  const [slotIndex, setSlotIndex] = useState<number>(0);
  const [slotTime, setSlotTime] = useState<string>("");

  const fetchDocInfo = () => {
    const doc = doctors.find((doc) => doc._id === docId);
    setDocInfo(doc);
    console.log(doc);
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);
    if (!docId) return;

    let today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    try {
      const slotArray = await getAvailableSlotsAPI(docId, year, month);

      if (!slotArray || !Array.isArray(slotArray)) {
        toast.error("No data received from server");
        return;
      }

      const slotMap: Record<string, { start: string; end: string; booked: boolean }[]> = {};

      slotArray.forEach((item: any) => {
        if (!item.isCancelled) {
          slotMap[item.date] = item.slots.filter((slot: any) => !slot.booked);
        }
      });

      let weekSlots: TimeSlot[][] = [];
      for (let i = 0; i < 7; i++) {
        let currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        const slots = slotMap[dateKey] || [];

       let timeSlots: TimeSlot[] = slots.map((slot) => {
  const { hour, minute } = parse12HourTime(slot.start);
  const slotDate = new Date(currentDate);
  slotDate.setHours(hour);
  slotDate.setMinutes(minute);
  return {
    datetime: slotDate,
    time: slot.start,
  };
});


        weekSlots.push(timeSlots);
      }

      setDocSlots(weekSlots);
    } catch (err: any) {
      console.error("Slot fetching failed:", err);

      if (err?.response?.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to load available slots");
      }
    }
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate("/login");
    }

    const selectedSlot = docSlots[slotIndex]?.[0];
    if (!selectedSlot) {
      toast.error("No slot selected");
      return;
    }

    try {
      const date = selectedSlot.datetime;
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const slotDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const { data } = await appointmentBookingAPI(docId!, slotDate, slotTime, token);

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);

  return (
    <div>
      {/* ------------  Doctor Details ------------ */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-primary w-full sm:max-w-72 rounded-lg"
            src={docInfo?.image}
            alt=""
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo?.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>
          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo?.degree} - {docInfo?.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo?.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo?.about}
            </p>
          </div>
          <p className="text-gray-500 font-medium mt-4">
            Appointment fee:{" "}
            <span className="text-gray-600">
              {currencySymbol}
              {docInfo?.fees}
            </span>
          </p>
        </div>
      </div>

      {/* ------------  Booking Slots ------------ */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.map((item, index) => (
            
            <div
              onClick={() => setSlotIndex(index)}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                slotIndex === index
                  ? "bg-primary text-white"
                  : "border border-gray-200"
              }`}
              key={index}
            >
              <p>
  {item[0] && item[0].datetime instanceof Date && !isNaN(item[0].datetime.getTime())

    ? daysOfWeek[item[0].datetime.getDay()]
    : "--"}
</p>
<p>
  {item[0] && item[0].datetime instanceof Date && !isNaN(item[0].datetime.getTime())

    ? item[0].datetime.getDate()
    : "--"}
</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots[slotIndex]?.length > 0 ? (
            docSlots[slotIndex].map((item, index) => (
              <p
                onClick={() => setSlotTime(item.time)}
                className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                  item.time === slotTime
                    ? "bg-primary text-white"
                    : "text-gray-400 border border-gray-300"
                }`}
                key={index}
              >
                {item.time.toLowerCase()}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-400">No available slots</p>
          )}
        </div>

        <button
          onClick={bookAppointment}
          className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6"
        >
          Book an appointment
        </button>
      </div>

      <RelatedDoctors docId={docId} speciality={docInfo?.speciality} />
    </div>
  );
};

export default Appointment;
