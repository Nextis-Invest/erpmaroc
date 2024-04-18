import { useForm } from "react-hook-form";

export default function StaffForm() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
      } = useForm();

  const onSubmit = (data) => console.log(data);

  console.log(watch("example")); // watch input value by passing the name of it

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col rounded-xl p-5 bg-[#eeeeee]"
    >
      {" "}
      <span className="font-bold text-3xl text-active">Edit Staff info</span>
      {/* register your input into the hook by invoking the "register" function */}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="State Name"
        type="text"
        {...register("stateName", { required: "State Name required." })}
      />
      {errors?.stateName && (
        <span className="text-warning font-medium">
          {errors?.stateName.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="City Name"
        type="text"
        {...register("cityName", { required: "City Name required." })}
      />
      {errors?.cityName && (
        <span className="text-warning font-medium">
          {errors?.cityName.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="Street Name"
        type="text"
        {...register("streetName", { required: "Street Name required." })}
      />
      {errors?.streetName && (
        <span className="text-warning font-medium">
          {errors?.streetName.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="Website"
        type="text"
        {...register("websiteUrl")}
      />
      {errors?.websiteUrl && (
        <span className="text-warning font-medium">
          {errors?.websiteUrl.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="Email"
        type="text"
        {...register("email", { required: "Email required." })}
      />
      {errors?.email && (
        <span className="text-warning font-medium">
          {errors?.email.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary  focus:outline-1 focus:outline-primary focus:border-primary block w-full p-2"
        defaultValue=""
        placeholder="Company Name"
        type="text"
        {...register("phone", { required: "Phone Number required." })}
      />
      {errors?.phone && (
        <span className="text-warning font-medium">
          {errors?.phone.message}
        </span>
      )}
      <button
        disabled={isLoading || isSubmitting}
        className="bg-active text-background mx-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
        type="submit"
      >
        {isLoading ? "Loading" : isSubmitting ? "Submitting" : "Save"}
      </button>
    </form>
  );
}
