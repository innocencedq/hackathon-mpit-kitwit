import axios from "axios";
import { initData } from "@telegram-apps/sdk";
import type { CreateListingData, Listing, UpdateListingData } from "../interface/Listings";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const request = async (
    endpoint: string,
    method: string = "GET",
    data?: any 
) => {
    const response = await axios.request({
        url: `${API_URL}/api/${endpoint}`,
        method: method,
        headers: {
            initData: `${initData?.raw()}`,
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        data: data ? JSON.stringify(data) : undefined
    });
    return response;
}

export const getAllListings = async (): Promise<{ listings: Listing[] }> => {
    const response = await request("advert/get/all", "GET");
    return response.data;
}

export const getListingById = async (listingId: number): Promise<{ listing: Listing }> => {
    const response = await request(`advert/get/${listingId}`, "GET");
    return response.data;
}

export const getUserListings = async (ownerId: number): Promise<{ listings: Listing[] }> => {
    const response = await request(`advert/get/user-adverts?owner_id=${ownerId}`, "GET");
    return response.data;
}

export const createListing = async (listingData: CreateListingData): Promise<{ message: string; listing: Listing }> => {
    const response = await request("advert/create", "POST", listingData);
    return response.data;
}

export const deleteListing = async (listingId: number): Promise<{ message: string; deleted_id: number }> => {
    const response = await request(`advert/delete?id=${listingId}`, "DELETE");
    return response.data;
}

export const updateListing = async (listingId: number, updateData: UpdateListingData): Promise<{ message: string; listing: Listing }> => {
    const response = await request(`advert/update/${listingId}`, "PUT", updateData);
    return response.data;
}

export default request;