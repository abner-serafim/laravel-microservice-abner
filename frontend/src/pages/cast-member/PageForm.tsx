// @flow
import * as React from 'react';
import {Page} from "../../components/Page";
import {Form} from "./Form";

type Props = {

};
const PageForm = (props: Props) => {
    return (
        <Page title={'Criar membro de elencos'}>
            <Form />
        </Page>
    );
};

export default PageForm;
