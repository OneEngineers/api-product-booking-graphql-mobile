import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

// Define a generic interface
interface httpPostGraphQlResponse<T = any> {
  data: T;
}

const axiosConfig: AxiosRequestConfig = {};
const defaultAxiosConfigHeader = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const getAxiosConfigOptions = (config: {
  headers?: any;
}): AxiosRequestConfig => {
  if (config && config.headers) {
    return {
      headers: {
        ...defaultAxiosConfigHeader.headers,
        ...config.headers,
      },
    };
  }
  return defaultAxiosConfigHeader;
};

export const httpGet = async (
  url: string,
  config: AxiosRequestConfig = axiosConfig
): Promise<[AxiosResponse | null, AxiosError | null]> => {
  try {
    const response = await axios.get(url, getAxiosConfigOptions(config));
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const httpPost = async (
  url: string,
  data: unknown = null,
  config: AxiosRequestConfig = axiosConfig
): Promise<[AxiosResponse | null, AxiosError | null]> => {
  try {
    const response = await axios.post(url, data, getAxiosConfigOptions(config));
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const httpPostGraphQl = async (
  url: string,
  data: unknown = null,
  config: AxiosRequestConfig = axiosConfig
): Promise<
  [AxiosResponse<httpPostGraphQlResponse> | null, AxiosError | null]
> => {
  try {
    const response = await axios.post(url, data, getAxiosConfigOptions(config));

    if (response.data.errors !== undefined && response.data.errors.length > 0) {
      return [null, response.data.errors[0]];
    }
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};

export const httpPatch = async (
  url: string,
  data: unknown = null,
  config: AxiosRequestConfig = axiosConfig
): Promise<[AxiosResponse | null, AxiosError | null]> => {
  try {
    const response = await axios.patch(
      url,
      data,
      getAxiosConfigOptions(config)
    );
    return [response, null];
  } catch (error) {
    return [null, error];
  }
};
