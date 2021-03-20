// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";
import {useParams} from "react-router";

type Props = {

};
const PageForm = (props: Props) => {
    const {id} = useParams<{id: string}>();
    return (
        <Page title={(id ? 'Editar' : 'Criar') + ' categoria'}>
            <Form />
        </Page>
    );
};

export default PageForm;
