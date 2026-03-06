import { useEffect, useState } from "react";
import { getMenu, createMenu } from "../api/menu.api";
import ImageUploader from "../components/ImageUploader";

export default function MenuManager() {

  const [menu, setMenu] = useState([]);

  const load = async () => {

    const res = await getMenu();

    setMenu(res.data);
  };

  useEffect(() => {
    load();
  }, []);

  const addMenu = async (formData) => {

    await createMenu(formData);

    load();
  };

  return (

    <div>

      <h2>Menu Manager</h2>

      <ImageUploader onUpload={addMenu} />

      <ul>

        {menu.map((m) => (
          <li key={m.id}>
            {m.name} - R{m.price}
          </li>
        ))}

      </ul>

    </div>
  );
}
