// "use server";

// import { revalidatePath } from "next/cache";

// import { enhanceAction } from "@/lib/server/enhance-actions";

// import { getLogger } from "@/utils/logger";
// import { getSupabaseServerClient } from "@/utils/supabase/client/server-client";

// /**
//  * @name updateProfileAction
//  * @description Server action to
//  */
// export const updateProfileAction = enhanceAction(
//   async (formData: FormData, user) => {
//     const logger = await getLogger();

//     const { data, success, error } =
//       .safeParse(Object.fromEntries(formData.entries()));

//     if (!success) {
//       throw new Error(
//         `Invalid form data: ${JSON.stringify(error.issues, null, 2)}`
//       );
//     }

//     const ctx = {
//       name: "internship_details.update",
//       userId: user.id,
//     };

//     logger.info(ctx, "Updating trainee internship...");

//     try {
//       const client = getSupabaseServerClient();
//       const service = createUpdateProfileService();

//       const result = await service.updateInternshipDetails({
//         client,
//         userId: user.id,
//         data
//       });

//       if (!result) {
//         logger.warn(ctx, "Internship not found or access denied");
//         throw new Error("Internship not found");
//       }

//       logger.info(ctx, result.message);

//       return result;
//     } catch (error) {
//       logger.error(
//         {
//           ...ctx,
//           error,
//         },

//         "Failed to perform update intership action"
//       );

//       throw error;
//     }
//   },
//   {}
// );
