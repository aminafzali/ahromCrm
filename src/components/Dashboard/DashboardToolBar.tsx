import MainMenu from "./MainMenu";
import QuickCreate from "./QuickCreate";

// کامپوننت اصلی
const DashboardToolBar = () => {
  return (
    <div className="flex gap-2 px-2 justify-between w-full ">
      <div>پنل مدیریت</div>
      <div className="flex">
        {/* <label className="swap swap-rotate">
        <input type="checkbox" />

        <div className="swap-on btn btn-ghost">
          <DIcon
            icon="fa-sun-bright"
            cdi={false}
            classCustom="text-gray-700 text-lg "
          />
        </div>

        <div className="swap-off btn btn-ghost">
          <DIcon
            icon="fa-moon"
            cdi={false}
            classCustom="text-gray-700 text-lg "
          />
        </div>
      </label> */}
        {/* 
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost rounded-field">
          <DIcon
            icon="fa-bell"
            cdi={false}
            classCustom="text-gray-700 text-lg"
          />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content bg-base-200 rounded-box z-1 mt-4 w-52 p-2 shadow-sm"
        >
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
        </ul>
      </div> */}
        <QuickCreate />
        <MainMenu />
      </div>
    </div>
  );
};

export default DashboardToolBar;
