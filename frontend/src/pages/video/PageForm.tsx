// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Index} from "./Form";
import {useParams} from "react-router";

type Props = {

};
const PageForm = (props: Props) => {
    const {id} = useParams<{id: string}>();
    return (
        <Page title={(id ? 'Editar' : 'Criar') + ' vídeo'}>
            <Index />
        </Page>
    );
};

export default PageForm;
