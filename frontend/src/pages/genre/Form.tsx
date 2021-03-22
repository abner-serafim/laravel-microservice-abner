// @flow
import * as React from 'react';
import {Box, Checkbox, FormControlLabel, MenuItem, TextField} from "@material-ui/core";
import {useForm} from "react-hook-form";
import genreHttp from "../../services/http/genre-http";
import {useEffect, useState} from "react";
import categoryHttp from "../../services/http/category-http";
import yup from "../../utils/vendor/yup";
import {useHistory, useParams} from "react-router";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";
import {Category, Genre, ListResponse, Response} from "../../services/models";
import {AxiosResponse} from "axios";
import {SubmitActions} from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";

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
        reset,
        trigger
    } = useForm<Genre>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            categories_id: [],
            is_active: true
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const [genre, setGenre] = useState<Genre | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        register({name: "categories_id"});
    }, [register]);

    useEffect(() => {
        let isCancelled = false;

        (async () => {
            setLoading(true);
            const promises = [categoryHttp.list()];

            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const res = await Promise.all(promises);

                let catRes: AxiosResponse<ListResponse<Category>> = res[0];
                let genRes: AxiosResponse<Response<Genre>> = res[1];

                 if (isCancelled) return;

                setCategories(catRes.data.data)

                if (id) {
                    let categories = genRes.data.data.categories;
                    setGenre(genRes.data.data);
                    reset({
                        ...genRes.data.data,
                        categories_id: categories ? categories.map(category => category.id) : []
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
        })();

        return () => {
            isCancelled = true;
        }
    }, [id, reset, snackbar]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !genre
                ? genreHttp.create<Response<Genre>>(formData)
                : genreHttp.update<Response<Genre>>(genre.id, formData)
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
        <DefaultForm onSubmit={handleSubmit(onSubmit)}>
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
            <SubmitActions
                atualizar={id !== null && id !== undefined}
                loading={loading}
                onClick={async () => {
                    if (await trigger()) await onSubmit(getValues(), null)
                }}
            />
        </DefaultForm>
    );
};
