class UsersController < ApplicationController
  
  before_filter :authenticate, :only => [:index, :edit, :update, :destroy]
 
  before_filter :correct_user, :only => [:edit, :update]
  
  before_filter :admin_user,   :only => :destroy


  def index
    @title = "All users"
    @users = User.all
  end

  
  def show
  	@user = User.find(params[:id])
	@title = @user.name
  end
  
  def new
   if(!current_user.nil?)
		redirect_to root_path
	else	
	   @title = "Sign up"
	   @user = User.new
  	end
  end

  def create
  	if(!current_user.nil?)
		redirect_to root_path
	else	
		@user = User.new(params[:user])
		if @user.save
			sign_in(@user)
			flash[:success] = "Welcome to Last Plant!"
			redirect_to @user
		else
		  @title = "Sign up"
		  @user.password = nil;
		  @user.password_confirmation = nil;
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


  private

    def authenticate
      deny_access unless signed_in?
    end

    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_path) unless current_user?(@user)
    end
	
	def admin_user
		if (current_user)
		redirect_to(root_path) unless current_user.admin?
		else
		redirect_to(root_path)
		end
    end


end
