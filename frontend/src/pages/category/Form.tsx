// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import categoryHttp from "../../services/http/category-http";
import yup from "../../utils/vendor/yup";
import {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";

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
    name: yup.string().label("Nome").required().min(3).max(255),
    is_active: yup.boolean(),
});

type Props = {

};
export const Form = (props: Props) => {
    const {id} = useParams<{id: string}>();

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

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const [category, setCategory] = useState<{id: string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: loading
    };

    useEffect(() => {
        if (!id) return;

        async function getCategory() {
            setLoading(true);
            try {
                const {data: {data}} = await categoryHttp.get(id);
                setCategory(data);
                reset(data);
            } catch (e) {

            } finally {
                setLoading(false);
            }
        }

        getCategory();
    }, [id, reset]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category
                ? categoryHttp.create(formData)
                : categoryHttp.update(category.id, formData)
            ;

            const {data: {data}} = await http;
            snackbar.enqueueSnackbar(
                'Categoria salva com sucesso',
                {variant: "success"}
            );
            setTimeout(() => {
                if (event) {
                    history.replace(`/categories/${data.id}/edit`)
                } else {
                    history.push('/categories');
                }
            });
        } catch (e) {
            console.log(e)
            snackbar.enqueueSnackbar(
                'Não foi possível salvar a categoria',
                {variant: "error"}
            );
        } finally {
            setLoading(false);
        }
    }

    const nameButton = !id ? 'Salvar' : 'Atualizar';

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                variant={"outlined"}
                disabled={loading}
                InputLabelProps={{shrink: true}}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
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
                disabled={loading}
                InputLabelProps={{shrink: true}}
            />
            <Box>
                <FormControlLabel control={
                    <Checkbox
                        inputRef={register}
                        name="is_active"
                        disabled={loading}
                        checked={watch('is_active')}
                        onChange={(event, value) => {
                            setValue('is_active', value)
                        }}
                    />
                } label={"Ativo?"} />
            </Box>
            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>{nameButton}</Button>
                <Button {...buttonProps} type="submit">{nameButton} e continuar editando</Button>
            </Box>
        </form>
    );
};
