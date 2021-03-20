// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, MenuItem, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import genreHttp from "../../services/http/genre-http";
import {useEffect, useState} from "react";
import categoryHttp from "../../services/http/category-http";
import yup from "../../utils/vendor/yup";
import {useHistory, useParams} from "react-router";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme: Theme) => ({
    submit: {
        margin: theme.spacing(1)
    }
}));

type Inputs = {
    name: string;
    categories_id: any;
    is_active: boolean;
}

const schema = yup.object().shape({
    name: yup.string().label("Nome").required().min(3).max(255),
    categories_id: yup.array().label("Categorias").required().min(1),
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
            categories_id: [],
            is_active: true
        }
    });

    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const [genre, setGenre] = useState<{id: string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: loading
    };

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        register({name: "categories_id"});
    }, [register]);

    useEffect(() => {
        async function getGenre() {
            setLoading(true);
            const promises = [categoryHttp.list()];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [catRes, genRes] = await Promise.all(promises);
                setCategories(catRes.data.data)

                if (id) {
                    setGenre(genRes.data.data);
                    reset({
                        ...genRes.data.data,
                        categories_id: genRes.data.data.categories.map(category => category.id)
                    });
                }
            } catch (e) {
                console.log(e)
                snackbar.enqueueSnackbar(
                    'Não foi possível carregar as informações',
                    {variant: "error"}
                );
            } finally {
                setLoading(false);
            }
        }

        getGenre();
    }, [id, reset, snackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !genre
                ? genreHttp.create(formData)
                : genreHttp.update(genre.id, formData)
            ;

            const {data: {data}} = await http;
            snackbar.enqueueSnackbar(
                'Gênero salva com sucesso',
                {variant: "success"}
            );
            setTimeout(() => {
                if (event) {
                    history.replace(`/genres/${data.id}/edit`)
                } else {
                    history.push('/genres');
                }
            });
        } catch (e) {
            console.log(e)
            snackbar.enqueueSnackbar(
                'Não foi possível salvar o gênero',
                {variant: "error"}
            );
        } finally {
            setLoading(false);
        }
    }

    console.log(errors);

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
                select
                name="categories_id"
                value={watch('categories_id')}
                label="Categorias"
                margin={"normal"}
                variant={"outlined"}
                fullWidth
                onChange={(e) => {
                    setValue('categories_id', e.target.value);
                }}
                SelectProps={{
                    multiple: true
                }}
                disabled={loading}
                InputLabelProps={{shrink: true}}
                error={errors.categories_id !== undefined}
                helperText={errors.categories_id && errors.categories_id.message}
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
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
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};
