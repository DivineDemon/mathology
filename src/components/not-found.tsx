import Notfound from "../assets/img/not_found.svg";

const NotFound = () => {
  return (
    <div className="mx-auto flex h-[30%] w-full flex-col items-center justify-center gap-5">
      <img src={Notfound} className="size-60" alt="Data Not Found" />
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold">Records Not Found</h1>
        <span className="text-sm text-gray-500">
          The records you're looking for was not found.
        </span>
      </div>
    </div>
  );
};

export default NotFound;
