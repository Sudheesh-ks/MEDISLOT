const StarRating = ({ rating }: { rating: number | undefined }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating! ? 'text-yellow-400' : 'text-slate-500'}>
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
