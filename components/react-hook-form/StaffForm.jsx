import { DataContext } from "@/Context/DataContext";
import { createBranch, updateBranch } from "@/lib/fetch/Branch";
import { createStaff, updateStaff } from "@/lib/fetch/staff";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function BranchForm({ mode }) {
  const [staffToEdit, setStaffToEdit] = useState({});
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData("branchData");
  console.log("🚀 ~ BranchForm ~ data:", data);

  const { user, error } = useUser();
  const { productData, isOpen, setIsOpen, setProductData, toggleSideBar } =
    useContext(DataContext);
    useEffect(() => {
      setStaffToEdit(productData);
    }, [productData]);
    console.log("🚀 ~ ProductForm ~ staffToEdit:", staffToEdit);
  
  const createStaffMutation = useMutation({
    mutationFn: async (d) => createStaff(d),

    onSuccess: async () => {
      console.log("Invalidating branchData");
      // await queryClient.invalidateQueries("branchData");
      await queryClient.refetchQueries({
        queryKey: "branchData",
        type: "active",
        exact: true,
      });
      // window.location.reload();
      setIsOpen(false);
    },
  });

  const editStaffMutation = useMutation({
    mutationFn: async (d) => updateStaff(d),

    onSuccess: async () => {
      console.log("Invalidating branchData");
      // await queryClient.invalidateQueries("branchData");
      await queryClient.refetchQueries({
        queryKey: "branchData",
        type: "active",
        exact: true,
      });
      // window.location.reload();
      setIsOpen(false);
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async (data) => {
    const d = {
      ...data,
      _id: staffToEdit?._id,
      email: user.email
    };
    console.log("🚀 ~ onSubmit ~ d:", d)

    if (mode == "edit") {
      try {
        console.log(mode);
        editStaffMutation.mutate(d);
      } catch (error) {
        console.log(error);
      }
    } else if (mode == "add") {
      try {
        console.log(mode);
        createStaffMutation.mutate(d);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col rounded-xl p-5 bg-[#eeeeee]"
    >
      <span className="font-bold text-3xl text-active">
        {mode == "edit" ? "Edit staff info" : "Add staff"}
      </span>

      {/* register your input into the hook by invoking the "register" function */}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.name}
        placeholder="Name"
        type="text"
        {...register("name", { required: "Name required." })}
      />
      {errors?.name && (
        <span className="text-warning font-medium">{errors?.name.message}</span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.position}
        placeholder="Position"
        type="text"
        {...register("position", { required: "Position required." })}
      />
      {errors?.position && (
        <span className="text-warning font-medium">
          {errors?.position.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.phone}
        placeholder="Phone Number"
        type="tel"
        {...register("phone")}
      />

      {errors?.phone && (
        <span className="text-warning font-medium">
          {errors?.phone.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.address}
        placeholder="Address"
        type="text"
        {...register("address", { required: "Address required." })}
      />
      {errors?.address && (
        <span className="text-warning font-medium">
          {errors?.address.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.salary}
        placeholder="Salary"
        type="number"
        {...register("salary", {
          min: 1,
          required: "Salary required.",
        })}
      />

      {errors?.salary && (
        <span className="text-warning font-medium">
          {errors?.salary.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.bonus}
        placeholder="Bonus"
        type="number"
        {...register("bonus")}
      />

      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        defaultValue={staffToEdit?.dayOff}
        placeholder="Taken day off"
        type="number"
        {...register("dayOff")}
      />

      <button
        disabled={isLoading || isSubmitting}
        className="bg-active text-background mx-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
        type="submit"
      >
        {mode == "edit" ? "Save" : "Add"}
      </button>
    </form>
  );
}
