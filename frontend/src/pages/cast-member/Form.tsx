// @flow
import * as React from 'react';
import {
    FormControl,
    FormControlLabel, FormHelperText, FormLabel, Radio,
    RadioGroup,
    TextField
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import {useEffect, useState} from "react";
import castMemberHttp from "../../services/http/cast-member-http";
import yup from "../../utils/vendor/yup";
import {useHistory, useParams} from "react-router";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";
import {CastMember, Response} from "../../services/models";
import {SubmitActions} from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";

const schema = yup.object().shape({
    name: yup.string().label("Nome").required().min(3).max(255),
    type: yup.number().label("Tipo").required(),
});

export const Form = () => {
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
    } = useForm<CastMember>({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            type: undefined,
        }
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const [castMember, setCastMember] = useState<CastMember | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        let isCancelled = false;

        (async () => {
            setLoading(true);
            try {
                const {data: {data}} = await castMemberHttp.get<Response<CastMember>>(id);
                if (isCancelled) return;
                setCastMember(data);
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
        register({name: "type"});
    }, [register]);

    async function onSubmit(formData, event) {
        castMemberHttp
            .create(formData)
            .then((responde) => console.log(responde));

        setLoading(true);
        try {
            const http = !castMember
                ? castMemberHttp.create<Response<CastMember>>(formData)
                : castMemberHttp.update<Response<CastMember>>(castMember.id, formData)
            ;

            const {data: {data}} = await http;
            snackbar.enqueueSnackbar(
                'Membro de elencos salva com sucesso',
                {variant: "success"}
            );
            setTimeout(() => {
                if (event) {
                    history.replace(`/cast_members/${data.id}/edit`)
                } else {
                    history.push('/cast_members');
                }
            });
        } catch (e) {
            console.log(e)
            snackbar.enqueueSnackbar(
                'Não foi possível salvar membro de elencos',
                {variant: "error"}
            );
        } finally {
            setLoading(false);
        }
    }

    console.log("errors", errors)

    return (
        <DefaultForm onSubmit={handleSubmit(onSubmit)}>
            <TextField
                inputRef={register}
                name="name"
                label="Nome"
                fullWidth
                disabled={loading}
                variant={"outlined"}
                InputLabelProps={{shrink: true}}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
            />
            <FormControl
                margin={"normal"}
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    name="type"
                    onChange={(e) => {
                        setValue("type", parseInt(e.target.value));
                    }}
                    value={watch("type") + ""}
                >
                    <FormControlLabel value="1" control={<Radio />} label={"Diretor"} />
                    <FormControlLabel value="2" control={<Radio />} label={"Ator"} />
                </RadioGroup>
                {
                    errors.type && <FormHelperText id="type-helper-text">{errors.type.message}</FormHelperText>
                }
            </FormControl>
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
