// @flow
import * as React from 'react';
import {Box, Checkbox, FormControlLabel, Grid, TextField, Typography} from "@material-ui/core";
import {useForm} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import videoHttp from "../../../services/http/video-http";
import yup from "../../../utils/vendor/yup";
import {useEffect, useState} from "react";
import {useHistory, useParams} from "react-router";
import {useSnackbar} from "notistack";
import {Video, Response} from "../../../services/models";
import {SubmitActions} from "../../../components/SubmitActions";
import {DefaultForm} from "../../../components/DefaultForm";
import {RatingField} from "./RatingField";
import InputFile from "../../../components/InputFile";

const schema = yup.object().shape({
    title: yup.string()
        .label("Título")
        .required()
        .min(3)
        .max(255),
    description: yup.string()
        .label("Descrição")
        .required()
        .min(3)
        .max(1000),
    year_launched: yup.number()
        .label("Ano de lançamento")
        .required()
        .min(1800)
        .max(2100),
    duration: yup.number()
        .label("Duração")
        .required()
        .min(1),
    rating: yup.string()
        .label("Classificação")
        .required(),
});

type Props = {

};
export const Index = (props: Props) => {
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
    } = useForm<Video>({
        resolver: yupResolver(schema),
        defaultValues: {
            opened: false
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        let isCancelled = false;

        (async () => {
            setLoading(true);
            try {
                const {data: {data}} = await videoHttp.get<Response<Video>>(id);
                if (isCancelled) return;
                setVideo(data);
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

    useEffect(() => {
        ['rating', 'opened'].forEach(name => register({name}));
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = !video
                ? videoHttp.create<Response<Video>>(formData)
                : videoHttp.update<Response<Video>>(video.id, formData)
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
        <DefaultForm
            GridItemProps={{md: 12}}
            onSubmit={handleSubmit(onSubmit)}
        >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        inputRef={register}
                        name="title"
                        label="Title"
                        fullWidth
                        margin={"normal"}
                        variant={"outlined"}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.title  !== undefined}
                        helperText={errors.title && errors.title.message}
                    />
                    <TextField
                        inputRef={register}
                        name="description"
                        label="Sinopse"
                        fullWidth
                        multiline
                        rows={4}
                        variant={"outlined"}
                        margin={"normal"}
                        disabled={loading}
                        InputLabelProps={{shrink: true}}
                        error={errors.description  !== undefined}
                        helperText={errors.description && errors.description.message}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                inputRef={register}
                                name="year_launched"
                                label="Ano de lançamento"
                                type={"number"}
                                fullWidth
                                margin={"normal"}
                                variant={"outlined"}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched  !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                inputRef={register}
                                name="duration"
                                label="Duração"
                                type={"number"}
                                fullWidth
                                margin={"normal"}
                                variant={"outlined"}
                                disabled={loading}
                                InputLabelProps={{shrink: true}}
                                error={errors.year_launched  !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br />
                    Gêneros
                    <br />
                    Categorias
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        error={errors.rating}
                        name={'rating'}
                        label={'Classificação'}
                        setValue={(value) => setValue('rating', value)}
                        disabled={loading}
                    />
                    <br />
                    Uploads
                    <InputFile />
                    <br />
                    <Box>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    inputRef={register}
                                    name="opened"
                                    disabled={loading}
                                    checked={watch('opened')}
                                    onChange={(event, value) => {
                                        setValue('opened', value)
                                    }}
                                />
                            } label={
                                <Typography color={"primary"} variant={"subtitle2"}>
                                    Quero que este conteúdo apareça na seção lançamentos
                                </Typography>
                            }
                            labelPlacement={"end"}
                        />
                    </Box>
                </Grid>
            </Grid>
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
