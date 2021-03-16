// @flow
import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, MenuItem, TextField} from "@material-ui/core";
import {makeStyles, Theme} from "@material-ui/core/styles";
import {useForm} from "react-hook-form";
import genreHttp from "../../services/http/genre-http";
import {useEffect, useState} from "react";
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

    const [categories, setCategories] = useState<any[]>([]);
    const {register, handleSubmit, getValues, setValue, watch} = useForm({
        defaultValues: {
            categories_id: [],
            is_active: true
        }
    });
    // const category = getValues()['categories_id'];

    useEffect(() => {
        register({name: "categories_id"});
    }, [register]);

    useEffect(() => {
        categoryHttp
            .list()
            .then(res => setCategories(res.data.data));
    }, []);

    function onSubmit(formData, event) {
        genreHttp
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
