// @flow
import * as React from 'react';
import {Box, Checkbox, FormControlLabel, TextField} from "@material-ui/core";
import {useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import categoryHttp from "../../services/http/category-http";
import yup from "../../utils/vendor/yup";
import {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {Category, Response} from "../../services/models";
import {SubmitActions} from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";

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
        reset,
        trigger
    } = useForm<Category>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            is_active: !id
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        let isCancelled = false;

        (async () => {
            setLoading(true);
            try {
                const {data: {data}} = await categoryHttp.get<Response<Category>>(id);
                if (isCancelled) return;
                setCategory(data);
                reset(data);
            } catch (e) {

            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
        }
    }, [id, reset]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !category
                ? categoryHttp.create<Response<Category>>(formData)
                : categoryHttp.update<Response<Category>>(category.id, formData)
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
