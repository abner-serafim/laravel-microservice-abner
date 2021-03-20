// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import categoryHttp from "../../services/http/category-http";
import yup from "../../utils/vendor/yup";
import {useEffect, useState} from "react";
import {useParams} from "react-router";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}));

type Inputs = {
    name: string;
    is_active: boolean;
}

const schema = yup.object().shape({
    name: yup.string().required().min(3).max(255),
    is_active: yup.boolean(),
});

type Props = {

};
export const Form = (props: Props) => {
    const classes = useStyles();

    const {id} = useParams<{id: string}>();

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit
    };

    const {
        register,
        watch,
        errors,
        handleSubmit,
        getValues,
        setValue,
        reset
    } = useForm<Inputs>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            is_active: !id
        }
    });

    const [category, setCategory] = useState<{id: string} | null>(null);

    useEffect(() => {
        if (!id) return;

        categoryHttp
            .get(id)
            .then(({data}) => {
                setCategory(data.data);
                reset(data.data);
            });
    }, [id, reset]);

    function onSubmit(formData, event) {
        const http = !category
            ? categoryHttp.create(formData)
            : categoryHttp.update(category.id, formData)
        ;

        http.then((responde) => console.log(responde));

        if (event) {

        } else {

        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                InputLabelProps={{shrink: true}}
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
                InputLabelProps={{shrink: true}}
            />
            <Box>
                <FormControlLabel control={
                    <Checkbox
                        inputRef={register}
                        name="is_active"
                        checked={watch('is_active')}
                        onChange={(event, value) => {
                            setValue('is_active', value)
                        }}
                    />
                } label={"Ativo?"} />
            </Box>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
