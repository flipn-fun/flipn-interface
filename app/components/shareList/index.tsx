import Modal from "../modal";
import styles from "./index.module.css";
import Content from "./content";    
import { useUserAgent } from "@/app/context/user-agent";
import { Popup } from "antd-mobile";

interface ShareListProps {
    show: boolean;
    onClose: () => void;
}

console.log("shareList", styles);

const ShareList: React.FC<ShareListProps> = ({ show, onClose }) => {
    const { isMobile } = useUserAgent();

    if (isMobile) {
        return (
            <Popup
                visible={show}
                onMaskClick={onClose}
                onClose={onClose}
                className="no-bg"
                bodyStyle={{
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    paddingTop: 10,
                    paddingBottom: 10,
                    background: '#252328'
                }}
            >
                <Content />
            </Popup>
        )
    }

    return (
        <Modal
            open={show}
            onClose={onClose}
        >
            <Content />
        </Modal>
    );
};

export default ShareList;
