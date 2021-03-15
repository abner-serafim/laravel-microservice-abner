import axios from "axios";


export const httpvideo = axios.create({
    baseURL: process.env.REACT_APP_MICRO_VIDEO_API_URL
});
