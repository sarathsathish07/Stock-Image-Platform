import { apiSlice } from "./apiSlice.js";

const USERS_URL = "/api/users";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/auth`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/profile`,
        method: "PUT",
        body: data,
      }),
    }),
    uploadImages: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/upload`,
        method: "PUT",
        body: data,
      }),
    }),
    getUploadedImages: builder.query({
      query: () => ({
        url: `${USERS_URL}/images`,
        method: "GET",
      }),
    }),
    editImage: builder.mutation({
      query: (formData) => ({
        url: `${USERS_URL}/images/${formData.get("id")}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteImage: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/images/${id}`,
        method: "DELETE",
      }),
    }),
    updateImageOrder: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/images/order`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useUploadImagesMutation,
  useGetUploadedImagesQuery,
  useEditImageMutation,
  useDeleteImageMutation,
  useUpdateImageOrderMutation,
} = usersApiSlice;
