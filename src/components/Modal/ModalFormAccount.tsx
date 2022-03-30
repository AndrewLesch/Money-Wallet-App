import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { Currency } from '../../сonstants';
import { v4 as uuidv4 } from 'uuid';
import Select, { components, OptionProps } from 'react-select';
import { changeDocumentTitle } from '../../utils';
import { modalSelectsStyle } from './ModalSelectStyle';
import ColorPicker from '../ColorPicker/ColorPicker';
import NumberInput from '../NumberInput/NumberInput';
import { AccountDto, CurrencyItem } from '../../model';
import { translateOptions } from '../../helpers/translateHelper';
import { t } from 'i18next';

import './ModalFormAccount.css';

const { Option } = components;

const IconOption = (props: OptionProps<CurrencyItem>) => (
  <Option {...props}>
    <div className="symbol-container">
      {props.data.symbol}
      <p className="symbol-label">{props.data.label}</p>
    </div>
  </Option>
);

const accountColors: Array<string> = [
  '#dfb6b6',
  '#c3dfb6',
  '#dfd4b6',
  '#b6dfbf',
  '#b6dedf',
  '#b6c8df',
  '#c9b6df',
  '#ffc4df',
];

type ModalAccountsProps = {
  modalIsOpen: boolean;
  accounts: Array<AccountDto>;
  editedAccount: AccountDto;
  isEditing: boolean;
  setIsEditing(isEditing: boolean): void;
  onSubmit(account: AccountDto): void;
  setEditedAccount(account: AccountDto): void;
  setModalIsOpen(modalIsOpen: boolean): void;
};

const ModalAccounts: React.FC<ModalAccountsProps> = ({
  onSubmit,
  modalIsOpen,
  setModalIsOpen,
  accounts,
  editedAccount,
  setEditedAccount,
  isEditing,
  setIsEditing,
}) => {
  const [account, setAccount] = useState<AccountDto>({
    id: uuidv4(),
    name: '',
    value: 0,
    currency: Currency.byn.value,
    color: accountColors[0],
  });
  const modalBodyRef = useRef(null);

  useEffect(() => {
    const closeModal = () => setModalIsOpen(false);
    const checkOutsideClick = (event: MouseEvent) => {
      if (
        modalIsOpen &&
        !modalBodyRef.current?.contains(event.target) &&
        accounts.length > 0
      ) {
        closeModal();
        setIsEditing(false);
        setEditedAccount(null);
      }
    };

    document.addEventListener('mousedown', checkOutsideClick);

    return () => {
      changeDocumentTitle('app.default.title');
      document.removeEventListener('mousedown', checkOutsideClick);
    };
  }, [accounts, modalIsOpen, setEditedAccount, setIsEditing, setModalIsOpen]);

  useEffect(() => {
    if (editedAccount) {
      setAccount(editedAccount);
      setIsEditing(true);
    }
  }, [editedAccount, modalIsOpen, setEditedAccount, setIsEditing]);

  const onSubmitForm = (event: React.SyntheticEvent): void => {
    event.preventDefault();
    onSubmit(account);
  };

  const setAccountInputValue =
    (name: string) =>
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setAccount({ ...account, [name]: event.target.value });
    };

  const setAccountCurrency = (option: CurrencyItem): void => {
    setAccount({ ...account, currency: option.value });
  };

  const setAccountColor = (color: string): void => {
    setAccount({ ...account, color: color });
  };

  return (
    <Modal isOpen={modalIsOpen} ariaHideApp={false} className="modal">
      <div className="modal-account-body" ref={modalBodyRef}>
        <form onSubmit={onSubmitForm}>
          <h2 className="modal-header-title">
            {t('modal.account-header-title')}
          </h2>

          <input
            value={account.name}
            className="account-name-input"
            placeholder={t('account-name-placeholder')}
            required
            maxLength={15}
            onChange={setAccountInputValue('name')}
          />

          <div className="accounts-inputs-container">
            <NumberInput
              onChange={(val: number) => setAccount({ ...account, value: val })}
              value={account.value}
              disabled={isEditing}
              placeholder={t('money-placeholder')}
              required={true}
              min={0}
              max={100000}
              step={0.01}
            />

            <Select
              isSearchable={false}
              styles={modalSelectsStyle}
              isDisabled={isEditing}
              value={translateOptions(Currency[account.currency])}
              onChange={setAccountCurrency}
              options={Object.values(Currency).map(translateOptions)}
              components={{ Option: IconOption }}
            />
          </div>

          <ColorPicker
            colors={accountColors}
            currentColor={account.color}
            onChange={setAccountColor}
          />

          <button
            type="submit"
            style={{ backgroundColor: `${account.color}` }}
            className="modal-button--submit"
          >
            {t('modal.account-save-button')}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ModalAccounts;
