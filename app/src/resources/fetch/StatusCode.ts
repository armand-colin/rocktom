import { Enum } from "../../utils/Enum";

export const StatusCode = Enum.create({
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    TooManyRequests: 429,
    InternalServerError: 500,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
})

export type StatusCode = Enum.Infer<typeof StatusCode>
