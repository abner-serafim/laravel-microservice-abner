// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import categoryHttp from "../../services/http/category-http";

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

    const {register, handleSubmit, getValues} = useForm({
        defaultValues: {
            is_active: true
        }
    });

    function onSubmit(formData, event) {
        categoryHttp
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
            <TextField
                inputRef={register}
                name="description"
                label="Descrição"
                fullWidth
                multiline
                rows={4}
                variant={"outlined"}
                margin={"normal"}
            />
            <Box>
                <Checkbox
                    inputRef={register}
                    name="is_active"
                    defaultChecked
                />
                Ativo?
            </Box>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
