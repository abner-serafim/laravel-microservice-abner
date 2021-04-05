// @flow
import * as React from 'react';
import {Button, InputAdornment, TextField, TextFieldProps} from "@material-ui/core";
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import {MutableRefObject, useRef, useState} from "react";

interface InputFileProps {
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
}
const InputFile: React.FC<InputFileProps> = (props) => {
    const fileRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [filename, setFilename] = useState("");

    const textFieldProps: TextFieldProps = {
        ...props.TextFieldProps,
        variant: "outlined",
        InputProps: {
            readOnly: true,
                endAdornment: (
                <InputAdornment position={'end'}>
                    <Button
                        endIcon={<CloudUploadIcon />}
                        variant={"contained"}
                        color={"primary"}
                        onClick={() => fileRef.current.click()}
                    >
                        Adicionar
                    </Button>
                </InputAdornment>
            )
        },
        value: filename
    };

    const inputFileProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
        ...props.InputFileProps,
        type: 'file',
        hidden: true,
        ref: fileRef,
        multiple: true,
        onChange(event) {
            const files = event.target.files;
            if (files && files.length) {
                setFilename(Array.from(files).map((file: any) => file.name).join(', '));
            }
            if (props.InputFileProps && props.InputFileProps.onChange) {
                props.InputFileProps.onChange(event);
            }
        }
    }

    return (
        <>
            <input {...inputFileProps} />
            <TextField {...textFieldProps} />
        </>
    );
};

export default InputFile;
