
import { useAppSelector } from "../app/hooks";
import { Card, Row, Col, Badge } from "react-bootstrap";
import {
    FiUser,
    FiMail,
    FiShield,
    FiCalendar,
} from "react-icons/fi";

const Profile = () => {
    const { user, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

    if (!isAuthenticated || !user) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-warning">
                    User profile not available. Please login again.
                </div>
            </div>
        );
    }

    const initials = user.name
        ?.split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="container-fluid py-3">
            <div className="mb-4">
                <h3 className="fw-bold mb-1">My Profile</h3>
                <p className="text-muted mb-0">
                    View your personal account information.
                </p>
            </div>

            <Row className="g-4">
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="text-center py-5">
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                style={{
                                    width: 100,
                                    height: 100,
                                    background: "#4A315D",
                                    color: "#C7E747",
                                    fontSize: 32,
                                    fontWeight: 700,
                                }}
                            >
                                {initials || <FiUser />}
                            </div>

                            <h4 className="fw-bold mb-1">
                                {user.name}
                            </h4>

                            <p className="text-muted mb-3">
                                {user.email}
                            </p>

                            <Badge bg="success" className="px-3 py-2">
                                Active Account
                            </Badge>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">
                                Personal Information
                            </h5>

                            <Row className="g-4">
                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 p-3 bg-light">
                                            <FiUser size={20} />
                                        </div>

                                        <div>
                                            <small className="text-muted">
                                                Full Name
                                            </small>
                                            <div className="fw-semibold">
                                                {user.name}
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 p-3 bg-light">
                                            <FiMail size={20} />
                                        </div>

                                        <div>
                                            <small className="text-muted">
                                                Email Address
                                            </small>
                                            <div className="fw-semibold">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 p-3 bg-light">
                                            <FiShield size={20} />
                                        </div>

                                        <div>
                                            <small className="text-muted">
                                                Account Status
                                            </small>
                                            <div className="fw-semibold text-success">
                                                Verified / Active
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={6}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-3 p-3 bg-light">
                                            <FiCalendar size={20} />
                                        </div>

                                        <div>
                                            <small className="text-muted">
                                                User ID
                                            </small>
                                            <div
                                                className="fw-semibold text-break"
                                                style={{ fontSize: 13 }}
                                            >
                                                {user._id}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
