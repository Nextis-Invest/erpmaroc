import { createProduct, updateProduct } from "@/lib/fetch/Product";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export default function ProductForm({mode}) {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
      } = useForm();

      const createProductMutation = useMutation({
        mutationFn: async (d) => createProduct(d),
    
        onSuccess: async () => {
          console.log("Invalidating branchData");
          // await queryClient.invalidateQueries("branchData");
          await queryClient.refetchQueries({
            queryKey: "products",
            type: "active",
            exact: true,
          });
          // window.location.reload();
          setIsOpen(false);
        },
      });

      const updateProductMutation = useMutation({
        mutationFn: async (d) => updateProduct(d),
    
        onSuccess: async () => {
          console.log("Invalidating branchData");
          // await queryClient.invalidateQueries("branchData");
          await queryClient.refetchQueries({
            queryKey: "products",
            type: "active",
            exact: true,
          });
          // window.location.reload();
          setIsOpen(false);
        },
      });

      const onSubmit = async (data) => {
        console.log(data)
        return
        const d = {
          ...data,
          ...user,
        };
    
        if(mode == "edit" )
        {
          try {
            console.log(mode)
            // editBranchMutation.mutate(d);
          } catch (error) {
            console.log(error);
          }
        } else if(mode == "create"){
          try {
            console.log(mode)
              // createBranchMutation.mutate(d);
          } catch (error) {
            console.log(error);
          }
        }
      };
      let data = []
  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col rounded-xl p-5 bg-[#eeeeee]"
    >
      <span className="font-bold text-3xl text-active">
        {mode == "edit" ? "Edit Product" : "Create Product"}
      </span>

      {/* register your input into the hook by invoking the "register" function */}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        //defaultValue={data?.data?.branch?.name}
        placeholder="Product Name"
        type="text"
        {...register("name", { required: "Product name required." })}
      />
      {errors?.name && (
        <span className="text-warning font-medium">
          {errors?.name.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        //defaultValue={data?.data?.branch?.description }
        placeholder="Description"
        type="text"
        {...register("description")}
      />

      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        // defaultValue={data?.data?.branch?.category}
        placeholder="Category"
        type="text"
        {...register("category")}
      />

      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        //defaultValue={data?.data?.branch?.price}
        placeholder="Price"
        type="number"
        {...register("price", {min: 1, required: "Product price required." })}
      />

      {errors?.price && (
        <span className="text-warning font-medium">
          {errors?.price.message}
        </span>
      )}
      <input
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        //defaultValue={data?.data?.branch?.quantity}
        placeholder="Quantity"
        type="number"
        {...register("quantity", {min: 1, required: "Quantity required." })}
      />

      {errors?.quantity && (
        <span className="text-warning font-medium">
          {errors?.quantity.message}
        </span>
      )}
            <textarea
        className="bg-gray-50 border mt-3 mb-1 border-gray-500 text-gray-900 text-md font-semibold rounded-lg focus:ring-primary focus:outline-none focus:border-primary block w-full p-2"
        //defaultValue={data?.data?.branch?.note}
        placeholder="Note"
        type="text"
        
        {...register("note")}
      />

      <button
        disabled={isLoading || isSubmitting}
        className="bg-active text-background mx-auto text-sm p-2.5 px-3 my-5 rounded-lg font-bold"
        type="submit"
      >
        {mode == "edit" ? "Save" : "Create"}
      </button>
    </form>
  );
}
