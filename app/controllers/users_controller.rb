class UsersController < ApplicationController
  
  before_filter :authenticate, :only => [:index, :edit, :update, :destroy, :show]
  before_filter :correct_user, :only => [:edit, :update]
  before_filter :admin_user,   :only => :destroy

  def index
    @title = "All users"
    @top_builder = User.paginate(:all, :per_page => 8, :page => params[:builder], :order => "\"createScore\" DESC")
    @top_destroyer = User.paginate(:all, :per_page => 8, :page => params[:destroyer], :order => "\"destroyScore\" DESC") 
  end
  
  def show  
    @user = User.find(params[:id])
    @title = @user.name
  end
  
  def new
    if signed_in?
      redirect_to root_path
    else
      @title = "Sign up"
      @user = User.new
    end
  end

  def create
  	if signed_in?
      redirect_to current_user
    else
	  @user = User.register_new(params, false)

      if @user.save
        sign_in(@user)
        flash[:success] = "Welcome to Last Plant!"
        redirect_to @user
      else
        @user.password = nil;
        @user.password_confirmation = nil;
        @title = "Sign up"
        render 'new'
      end
    end
  end

  def edit
    @title = "Edit user"
  end

  def update
  	@user = User.find(params[:id])

    if @user.update_attributes(params[:user])
      flash[:success] = "Profile updated."
      redirect_to @user
    else
      @title = "Edit user"
      render 'edit'
    end
  end
  
  def destroy
    User.find(params[:id]).destroy
    flash[:success] = "User destroyed."
    redirect_to users_path
  end
end
