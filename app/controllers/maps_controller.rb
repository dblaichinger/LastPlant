class MapsController < ApplicationController
  protect_from_forgery :except => [:create]

  #before_filter :authenticate, :only => [:new, :create, :show, :destroy, :gamehandler, :protect_index, :destroy_index]

  def new
  
  end

  def create
  #this method is only called per AJAX request
    mapname = User.find_by_id(session[:id]).name + "'s " + (Map.find_all_by_user_id(session[:id]).count + 1).to_s + ". Map"
    @map = Map.new(:name => mapname, :user_id => session[:id], :content => params[:map], :score => params[:score])

    if @map.save
        #flash.now[:success] = "created successfully!"
    else
        #flash.now[:error] = "failed to save map "
    end
    
    render 'create'
  end

  def show
  end

  def destroy
    @map = Map.find(params[:id]).destroy
    flash[:success] = "Map destroyed."
    redirect_to protect_path
  end

  def gamehandler
  end

  def protect_index
    @maps = Map.find_all_by_user_id(session[:id])
  end
  
  def destroy_index
    @rand_maps = Map.find(:all, :offset => (Map.count * rand).to_i, :limit => 5)
  end
  
end

