import { observer } from "mobx-react-lite";
import { Button, Divider, Form, Header, Icon } from "semantic-ui-react";
import { useStore } from "../../app/stores/store";
import { useEffect, useMemo, useState } from "react";
import LoadingComponent from "../../app/layout/LoadingComponent";

interface Props{
    updateSupervisorPersonId: (newSupervisorPersonId: number | null) => void;
}

export default observer(function SupervisorPicker({updateSupervisorPersonId} : Props){
    const { modalStore, usawcUserStore} = useStore();
    const { closeModal } = modalStore;
    const { usawcUsers, usawcUserloading, loadUSAWCUsers } = usawcUserStore;
    const [supervisor, setSupervisor] = useState<number | null>(null); // Selected author

      useEffect(() => {
        if (usawcUsers.length === 0 && !usawcUserloading) {
          loadUSAWCUsers();
        }
      }, [loadUSAWCUsers, usawcUsers, usawcUserloading]);

      const memoizedAuthorOptions = useMemo(() => {
        return usawcUsers.map((user) => ({
          key: user.personId,
          text: user.middleName
            ? `${user.lastName}, ${user.firstName}, ${user.middleName}`
            : `${user.lastName}, ${user.firstName}`,
          value: user.personId,
        }));
      }, [usawcUsers]);

        if (usawcUserloading ) return <LoadingComponent content="loading..." />;

        const handleSupervisorChange = (value : number | null ) =>{
            setSupervisor(value as number || null);
            updateSupervisorPersonId(value);
            closeModal()
        }

    return (
        <>
          <Button
                floated="right"
                icon
                size="mini"
                color="black"
                compact
                onClick={() => closeModal()}
            >
                <Icon name="close" />
            </Button>
            <Divider horizontal>
                <Header as="h2" className="industry">
                    <Icon name="user secret" />
                 CHOOSE YOUR SUPERVISOR 
                </Header>
            </Divider>
            <Form.Dropdown
            placeholder="Select your supervisor"
            fluid
            search
            selection
            options={memoizedAuthorOptions}
            value={supervisor ?? undefined}
            onChange={(_e, { value }) => handleSupervisorChange(value as number || null)}
          />
        </>
    )
  
})