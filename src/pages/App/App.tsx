import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Records from '../Records/Records';
import Account from '../../components/Account/Account';
import Statistics from '../Statistics/Statistics';
import Authorization from '../Authorization/Authorization';
import ModalFormRecord from '../../components/Modal/ModalFormRecord';
import ModalFormAccount from '../../components/Modal/ModalFormAccount';
import NotificationService from '../../services/NotificationService';
import Loader from '../../components/Loader/Loader';
import { useAccountsAppState } from './hooks/useAppAccountsState';
import { useRecordsAppState } from './hooks/useAppRecordsState';
import { AccountDto, RecordDto } from '../../model';
import { AppContextType } from '../../model';
import { auth, SignOut } from '../../firebase';
import { User } from 'firebase/auth';
import { AccountsApi } from '../../api/AccountsApi';

import 'react-toastify/dist/ReactToastify.css';
import './App.css';

export const Context = React.createContext<AppContextType>(null);

const App = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: User) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const {
    loading: accountsLoading,
    accounts,
    editedAccount,
    setEditedAccount,
    accountModalIsOpen,
    setAccountModalIsOpen,
    isEditingAccount,
    setIsEditingAccount,
    openAccountModal,
    onEditAccount,
    removeAccount,
    onSubmitAccount,
    updateAccounts,
  } = useAccountsAppState(user);

  const {
    loading: recordsLoading,
    records,
    editedRecord,
    onEditRecord,
    setEditedRecord,
    recordModalIsOpen,
    setRecordModalIsOpen,
    isEditingRecord,
    updateRecords,
    openRecordModal,
    removeRecord,
    onSubmitRecord,
  } = useRecordsAppState(user);

  const removeAccountById = (accountId: string): void => {
    removeAccount(accountId);

    const remainingRecords: Array<RecordDto> = records.filter(
      (record) => record.accountId !== accountId
    );

    if (records.length !== remainingRecords.length) {
      updateRecords(remainingRecords);
    }
  };

  const removeRecordWrapper = (record: RecordDto): void => {
    removeRecord(record, accounts);
    AccountsApi.createAccounts(accounts, 'accounts');
  };

  const onSubmitRecordWrapper = (recordFormData: RecordDto): void => {
    const nextAccounts: Array<AccountDto> = onSubmitRecord(
      recordFormData,
      accounts,
      records
    );

    if (nextAccounts) {
      updateAccounts(nextAccounts);
    }
  };

  const onSubmitAccountWrapper = (accountFormData: AccountDto): void => {
    const isSubmitSuccessful: boolean = onSubmitAccount(accountFormData);

    if (!isSubmitSuccessful) {
      NotificationService.error('Введите уникальный аккаунт');
    }
  };

  return loading ? (
    <Loader height="100vh" />
  ) : user ? (
    <Context.Provider
      value={{
        onRemoveRecord: removeRecordWrapper,
        onEditRecord,
      }}
    >
      <div className="container">
        <div className="header-accounts-container">
          <div className="header-autorization-container">
            <h2 className="header-app-logo">Wallet App Calc</h2>
            <div className="autourization-container__buttons">
              <h4 className="header-user-name">
                {user ? user.displayName : ''}
              </h4>
              <button className="primary-button" onClick={SignOut}>
                Выйти
              </button>
            </div>
          </div>
          <ul className="header-accounts-list">
            {accountsLoading ? (
              <Loader height="5vh" />
            ) : (
              accounts.map((account) => (
                <Account
                  key={account.id}
                  account={account}
                  onEditAccount={onEditAccount}
                  onRemoveAccount={removeAccountById}
                />
              ))
            )}
          </ul>
        </div>

        <div className="nav-container">
          <div className="nav-container__buttons">
            <button className="primary-button" onClick={openAccountModal}>
              Добавить аккаунт
            </button>

            {accountModalIsOpen && (
              <ModalFormAccount
                onSubmit={onSubmitAccountWrapper}
                modalIsOpen={accountModalIsOpen}
                setModalIsOpen={setAccountModalIsOpen}
                accounts={accounts}
                editedAccount={editedAccount}
                setEditedAccount={setEditedAccount}
                setIsEditing={setIsEditingAccount}
                isEditing={isEditingAccount}
              />
            )}

            <button className="primary-button" onClick={openRecordModal}>
              Добавить запись
            </button>
            {recordModalIsOpen &&
              (editedRecord === null || isEditingRecord === true) && (
                <ModalFormRecord
                  onSubmit={onSubmitRecordWrapper}
                  accounts={accounts}
                  modalIsOpen={recordModalIsOpen}
                  setModalIsOpen={setRecordModalIsOpen}
                  editedRecord={editedRecord}
                  setEditedRecord={setEditedRecord}
                />
              )}
          </div>

          <div className="nav-container__links">
            <Link className="nav-link" to="/">
              Записи
            </Link>
            <Link className="nav-link" to="/statistics">
              Статистика
            </Link>
          </div>
        </div>
        <hr className="content-line" />

        <Routes>
          <Route
            path="/"
            element={<Records records={records} loading={recordsLoading} />}
          />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Context.Provider>
  ) : (
    <Routes>
      <Route path="/authorization" element={<Authorization />} />
      <Route path="*" element={<Navigate to="/authorization" />} />
    </Routes>
  );
};

export default App;