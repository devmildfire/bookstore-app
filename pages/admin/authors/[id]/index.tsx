import * as React from 'react';

import { EditAuthor } from '@/components/Dashboard';
import { withDashboardLayout } from '@/layouts';
import { NextPageWithLayout } from '@/types/page';
import { GetServerSideProps } from 'next/types';
import { useLocalStore } from '@/store/hooks';
import { AuthorStore, AuthorStoreProvider } from '@/store/locals';
import { observer } from 'mobx-react-lite';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.query;

  return {
    props: { id },
  };
};

const AddAuthorPage: NextPageWithLayout<{ id: string }> = ({ id }) => {
  const idNumber = +id;
  const authorStore = useLocalStore(() => new AuthorStore({ id: idNumber }));

  React.useEffect(() => {
    authorStore.load();
  }, [authorStore]);

  if (!authorStore.author) {
    // TODO: добавить лоудер или скелетон
    return <h1>Загрузка...</h1>;
  }

  return (
    <AuthorStoreProvider value={{ store: authorStore }}>
      <EditAuthor author={authorStore.author} save={authorStore.update} />
    </AuthorStoreProvider>
  );
};

export default withDashboardLayout(observer(AddAuthorPage));
