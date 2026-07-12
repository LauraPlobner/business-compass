import { useNavigate } from "react-router-dom";
import { CompareView } from "@/components/CompareView";
import { useAppData } from "@/pages/AppLayout";

const Compare = () => {
  const { ideasApi, criteriaApi } = useAppData();
  const navigate = useNavigate();

  return (
    <CompareView
      ideas={ideasApi.ideas}
      weights={criteriaApi.weights}
      categories={criteriaApi.categories}
      onSelectIdea={(id) => navigate(`/ideen/${id}`)}
    />
  );
};

export default Compare;
