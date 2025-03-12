import Notfound from "../assets/img/object.svg";

const NotQuestion = () => {
  return (
    <div className="mx-auto flex h-[30%] w-1/3 flex-col items-center justify-center gap-5">
      <img src={Notfound} className="size-60" alt="Data Not Found" />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">You have no questions</h1>
        <span className="text-center text-sm text-gray-500">
          We couldn't find any lessons matching "". Try adjusting your search or
          browse existing categories.
        </span>
      </div>
    </div>
  );
};

export default NotQuestion;