import {format, parseISO} from "date-fns";

export const formatIsoToDTH = (value: string) => {
    return format(parseISO(value), 'dd/MM/yyyy HH:ii:ss')
}

export const formatIsoToDT = (value: string) => {
    return format(parseISO(value), 'dd/MM/yyyy HH:ii:ss')
}
