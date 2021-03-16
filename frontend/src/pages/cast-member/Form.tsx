// @flow
import * as React from 'react';
import {
    Box,
    Button,
    ButtonProps,
    FormControl,
    FormControlLabel, FormLabel, Radio,
    RadioGroup,
    TextField
} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import {useEffect} from "react";
import castMemberHttp from "../../services/http/cast-member-http";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}));

type Props = {

};
export const Form = (props: Props) => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: "outlined",
        color: "primary",
        className: classes.submit
    };

    const {register, handleSubmit, getValues, setValue} = useForm();

    useEffect(() => {
        register({name: "type"});
    }, [register]);

    function onSubmit(formData, event) {
        castMemberHttp
            .create(formData)
            .then((responde) => console.log(responde));

        if (event) {

        } else {

        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
            />
            <FormControl margin={"normal"}>
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue("type", parseInt(e.target.value));
                    }}
                >
                    <FormControlLabel value="1" control={<Radio />} label={"Diretor"} />
                    <FormControlLabel value="2" control={<Radio />} label={"Ator"} />
                </RadioGroup>
            </FormControl>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
