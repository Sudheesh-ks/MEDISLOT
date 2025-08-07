import ConsultationEndedCard from '../../components/common/ConsulationEnded';

const ConsultationEndedPage = () => {
  return (
    <div className="min-h-screen p-6 flex justify-center items-center bg-[#0a0a0a]">
      <div className="w-full max-w-xl">
        <ConsultationEndedCard role="user" />
      </div>
    </div>
  );
};

export default ConsultationEndedPage;
